from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta
from datetime import datetime
from django.db.models import Count
from .services.gemini_report_generator import generate_student_report
from rest_framework.permissions import IsAuthenticated

from django.conf import settings
import os

from rest_framework.views import APIView
from django.http import HttpResponse

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

from students.models import Student
from .services.gemini_report_generator import generate_student_report

from students.models import Student
from activities.models import Phase, Content, Level
from .models import StudentPhaseProgress, StudentAnswer, StudentPhaseSession
from .serializers import (
    PhaseProgressDetailSerializer,
    PhaseResultSerializer,
    PhaseSessionSerializer,
    PhaseMapItemSerializer,
    LevelProgressItemSerializer,
)


class PhaseProgressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, phase_id):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            phase = Phase.objects.select_related('content', 'level').get(pk=phase_id)
        except Phase.DoesNotExist:
            return Response(
                {'detail': 'Fase não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        phase_progress, _ = StudentPhaseProgress.objects.get_or_create(
            student=student,
            phase=phase
        )

        total_questions = phase.questions.count()

        answered_correctly_count = StudentAnswer.objects.filter(
            student=student,
            question__phase=phase,
            is_correct=True
        ).values_list('question_id', flat=True).distinct().count()

        is_unlocked = self._is_phase_unlocked(student, phase)

        next_phase = Phase.objects.filter(
            content=phase.content,
            level=phase.level,
            phase_number=phase.phase_number + 1,
            is_active=True
        ).first()

        next_phase_unlocked = False
        next_phase_id = None

        if next_phase:
            next_phase_id = next_phase.id
            next_phase_unlocked = self._is_phase_unlocked(student, next_phase)

        data = {
            'student_id': student.id,
            'phase_id': phase.id,
            'completed': phase_progress.completed,
            'score': phase_progress.score,
            'correct_answers': phase_progress.correct_answers,
            'wrong_answers': phase_progress.wrong_answers,
            'total_questions': total_questions,
            'answered_correctly_count': answered_correctly_count,
            'is_unlocked': is_unlocked,
            'next_phase_id': next_phase_id,
            'next_phase_unlocked': next_phase_unlocked,
        }

        serializer = PhaseProgressDetailSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _is_phase_unlocked(self, student, phase):
        if phase.phase_number == 1:
            return True

        previous_phase = Phase.objects.filter(
            content=phase.content,
            level=phase.level,
            phase_number=phase.phase_number - 1,
            is_active=True
        ).first()

        if not previous_phase:
            return False

        return StudentPhaseProgress.objects.filter(
            student=student,
            phase=previous_phase,
            completed=True
        ).exists()


class PhaseResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, phase_id):
        session_id = request.query_params.get('session_id')

        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            phase = Phase.objects.select_related('content', 'level').get(pk=phase_id)
        except Phase.DoesNotExist:
            return Response(
                {'detail': 'Fase não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        phase_progress, _ = StudentPhaseProgress.objects.get_or_create(
            student=student,
            phase=phase
        )

        session = None

        if session_id:
            session = StudentPhaseSession.objects.filter(
                pk=session_id,
                student=student,
                phase=phase
            ).first()

        if not session:
            session = StudentPhaseSession.objects.filter(
                student=student,
                phase=phase
            ).first()

        session_correct_answers = session.correct_answers if session else 0
        session_wrong_answers = session.wrong_answers if session else 0

        attempts_count = session_correct_answers + session_wrong_answers

        accuracy = 0
        if attempts_count > 0:
            accuracy = round((session_correct_answers / attempts_count) * 100)

        time_spent_seconds = 0
        if session and session.started_at:
            end_time = session.finished_at or timezone.now()
            time_spent_seconds = max(0, int((end_time - session.started_at).total_seconds()))

        total_questions = phase.questions.count()

        next_phase = Phase.objects.filter(
            content=phase.content,
            level=phase.level,
            phase_number=phase.phase_number + 1,
            is_active=True
        ).first()

        next_phase_id = None
        next_phase_number = None
        next_phase_unlocked = False

        if next_phase:
            next_phase_id = next_phase.id
            next_phase_number = next_phase.phase_number
            next_phase_unlocked = self._is_phase_unlocked(student, next_phase)

        data = {
            'student_id': student.id,
            'phase_id': phase.id,
            'phase_number': phase.phase_number,
            'content_slug': phase.content.slug,
            'content_title': phase.content.name,
            'level_code': phase.level.code,
            'level_title': phase.level.title,
            'completed': phase_progress.completed,
            'score': phase_progress.score,
            'points_earned': session.points_earned if session else 0,
            'correct_answers': session_correct_answers,
            'wrong_answers': session_wrong_answers,
            'total_questions': total_questions,
            'accuracy': accuracy,
            'time_spent_seconds': time_spent_seconds,
            'next_phase_id': next_phase_id,
            'next_phase_number': next_phase_number,
            'next_phase_unlocked': next_phase_unlocked,
        }

        serializer = PhaseResultSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _is_phase_unlocked(self, student, phase):
        if phase.phase_number == 1:
            return True

        previous_phase = Phase.objects.filter(
            content=phase.content,
            level=phase.level,
            phase_number=phase.phase_number - 1,
            is_active=True
        ).first()

        if not previous_phase:
            return False

        return StudentPhaseProgress.objects.filter(
            student=student,
            phase=previous_phase,
            completed=True
        ).exists()


class StartPhaseSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, phase_id):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            phase = Phase.objects.get(pk=phase_id)
        except Phase.DoesNotExist:
            return Response(
                {'detail': 'Fase não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        open_sessions = StudentPhaseSession.objects.filter(
            student=student,
            phase=phase,
            is_finished=False
        ).order_by('-started_at')

        session = open_sessions.first()

        old_open_sessions = open_sessions.exclude(
            id=session.id
        ) if session else StudentPhaseSession.objects.none()

        for old_session in old_open_sessions:
            old_session.finished_at = timezone.now()
            old_session.is_finished = True
            old_session.save(update_fields=['finished_at', 'is_finished'])

        if not session:
            session = StudentPhaseSession.objects.create(
                student=student,
                phase=phase
            )
        elif session.paused_at:
            paused_duration = int((timezone.now() - session.paused_at).total_seconds())
            session.total_paused_seconds += max(0, paused_duration)
            session.paused_at = None
            session.save(update_fields=['total_paused_seconds', 'paused_at'])

        answered_correctly_question_ids = list(
            StudentAnswer.objects.filter(
                student=student,
                session=session,
                question__phase=phase,
                is_correct=True
            ).values_list('question_id', flat=True).distinct()
        )

        data = {
            'session_id': session.id,
            'student_id': student.id,
            'phase_id': phase.id,
            'correct_answers': session.correct_answers,
            'wrong_answers': session.wrong_answers,
            'is_finished': session.is_finished,
            'started_at': session.started_at,
            'finished_at': session.finished_at,
            'total_paused_seconds': session.total_paused_seconds,
            'paused_at': session.paused_at,
            'answered_correctly_question_ids': answered_correctly_question_ids,
        }

        serializer = PhaseSessionSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PausePhaseSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, phase_id):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        session_id = request.data.get('session_id')

        if not session_id:
            return Response(
                {'detail': 'session_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = StudentPhaseSession.objects.get(
                pk=session_id,
                student=student,
                phase_id=phase_id,
                is_finished=False
            )
        except StudentPhaseSession.DoesNotExist:
            return Response(
                {'detail': 'Sessão não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not session.paused_at:
            session.paused_at = timezone.now()
            session.save(update_fields=['paused_at'])

        return Response({
            'session_id': session.id,
            'paused_at': session.paused_at,
            'total_paused_seconds': session.total_paused_seconds,
        }, status=status.HTTP_200_OK)


class ResumePhaseSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, phase_id):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        session_id = request.data.get('session_id')

        if not session_id:
            return Response(
                {'detail': 'session_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = StudentPhaseSession.objects.get(
                pk=session_id,
                student=student,
                phase_id=phase_id,
                is_finished=False
            )
        except StudentPhaseSession.DoesNotExist:
            return Response(
                {'detail': 'Sessão não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.paused_at:
            paused_duration = int((timezone.now() - session.paused_at).total_seconds())
            session.total_paused_seconds += max(0, paused_duration)
            session.paused_at = None
            session.save(update_fields=['total_paused_seconds', 'paused_at'])

        return Response({
            'session_id': session.id,
            'paused_at': session.paused_at,
            'total_paused_seconds': session.total_paused_seconds,
        }, status=status.HTTP_200_OK)


class PhaseMapStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content_slug = request.query_params.get('content')
        level_code = request.query_params.get('level')

        if not content_slug or not level_code:
            return Response(
                {'detail': 'content e level são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            content = Content.objects.get(slug=content_slug)
        except Content.DoesNotExist:
            return Response(
                {'detail': 'Conteúdo não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            level = Level.objects.get(code=level_code)
        except Level.DoesNotExist:
            return Response(
                {'detail': 'Nível não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        phases = Phase.objects.filter(
            content=content,
            level=level,
            is_active=True
        ).order_by('phase_number')

        result = []

        for phase in phases:
            phase_progress = StudentPhaseProgress.objects.filter(
                student=student,
                phase=phase
            ).first()

            result.append({
                'phase_id': phase.id,
                'phase_number': phase.phase_number,
                'is_active': phase.is_active,
                'is_unlocked': self._is_phase_unlocked(student, phase),
                'is_completed': phase_progress.completed if phase_progress else False,
                'score': phase_progress.score if phase_progress else 0,
                'total_questions': phase.questions.count(),
            })

        serializer = PhaseMapItemSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _is_phase_unlocked(self, student, phase):
        if phase.phase_number == 1:
            return True

        previous_phase = Phase.objects.filter(
            content=phase.content,
            level=phase.level,
            phase_number=phase.phase_number - 1,
            is_active=True
        ).first()

        if not previous_phase:
            return False

        return StudentPhaseProgress.objects.filter(
            student=student,
            phase=previous_phase,
            completed=True
        ).exists()


class LevelProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        content_slug = request.query_params.get('content')

        if not content_slug:
            return Response(
                {'detail': 'content é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            content = Content.objects.get(slug=content_slug)
        except Content.DoesNotExist:
            return Response(
                {'detail': 'Conteúdo não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        levels = Level.objects.all().order_by('difficulty_order')
        result = []
        previous_level_completed = True

        for index, level in enumerate(levels):
            phases = Phase.objects.filter(
                content=content,
                level=level,
                is_active=True
            )

            total_phases = phases.count()

            completed_phases = StudentPhaseProgress.objects.filter(
                student=student,
                phase__in=phases,
                completed=True
            ).count()

            total_score = StudentPhaseProgress.objects.filter(
                student=student,
                phase__in=phases
            ).aggregate(total=Sum('score'))['total'] or 0

            level_completed = total_phases > 0 and completed_phases == total_phases

            if total_phases == 0:
                unlocked = False
            elif index == 0:
                unlocked = True
            else:
                unlocked = previous_level_completed

            result.append({
                'level_id': level.id,
                'level_code': level.code,
                'level_title': level.title,
                'difficulty_order': level.difficulty_order,
                'total_phases': total_phases,
                'completed_phases': completed_phases,
                'total_score': total_score,
                'unlocked': unlocked,
                'completed': level_completed,
            })

            previous_level_completed = level_completed

        serializer = LevelProgressItemSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get("period", "all")

        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Aluno não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        now = timezone.now()

        if period == "7d":
            start_date = now - timedelta(days=7)
        elif period == "14d":
            start_date = now - timedelta(days=14)
        elif period == "30d":
            start_date = now - timedelta(days=30)
        else:
            start_date = None

        finished_sessions = StudentPhaseSession.objects.filter(
            student=student,
            is_finished=True,
            points_earned__gt=0
        ).select_related(
            "phase__content",
            "phase__level"
        )

        if start_date:
            finished_sessions = finished_sessions.filter(finished_at__gte=start_date)

        latest_session_by_phase = {}

        for session in finished_sessions.order_by("phase_id", "-finished_at", "-started_at"):
            if session.phase_id not in latest_session_by_phase:
                latest_session_by_phase[session.phase_id] = session

        valid_sessions = list(latest_session_by_phase.values())

        correct_answers = sum(session.correct_answers for session in valid_sessions)
        wrong_answers = sum(session.wrong_answers for session in valid_sessions)

        total_answers = correct_answers + wrong_answers

        accuracy = (
            round((correct_answers / total_answers) * 100)
            if total_answers else 0
        )

        completed_phase_progress = StudentPhaseProgress.objects.filter(
            student=student,
            completed=True
        )

        if start_date:
            completed_phase_progress = completed_phase_progress.filter(
                updated_at__gte=start_date
            )

        total_activities = completed_phase_progress.count()

        contents = Content.objects.all()
        content_progress = []

        for content in contents:
            phases = Phase.objects.filter(content=content)
            total_phases = phases.count()

            completed = StudentPhaseProgress.objects.filter(
                student=student,
                phase__in=phases,
                completed=True
            ).count()

            progress_percent = (
                round((completed / total_phases) * 100)
                if total_phases else 0
            )

            content_progress.append({
                "content": content.name,
                "progress": progress_percent
            })

        history_sessions = sorted(
            valid_sessions,
            key=lambda session: session.finished_at or session.started_at,
            reverse=True
        )[:5]

        history = []

        for session in history_sessions:
            total = session.correct_answers + session.wrong_answers

            seconds = (
                int((session.finished_at - session.started_at).total_seconds())
                - session.total_paused_seconds
                if session.finished_at else 0
            )

            history.append({
                "title": f"{session.phase.content.name} - {session.phase.level.title} - Fase {session.phase.phase_number}",
                "content": session.phase.content.name,
                "level": session.phase.level.title,
                "phase_number": session.phase.phase_number,
                "correct": session.correct_answers,
                "total": total,
                "seconds": max(0, seconds),
                "points": session.points_earned,
                "finished_at": session.finished_at,
            })

        return Response({
            "accuracy": accuracy,
            "correct_answers": correct_answers,
            "wrong_answers": wrong_answers,
            "total_activities": total_activities,
            "content_progress": content_progress,
            "history": history
        })


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    CONTENT_ORDER = ["adicao", "subtracao", "multiplicacao", "divisao", "problemas"]

    def get(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Aluno não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        finished_sessions = StudentPhaseSession.objects.filter(
            student=student,
            is_finished=True,
            points_earned__gt=0
        ).select_related(
            "phase__content",
            "phase__level"
        )

        latest_session_by_phase = {}

        for session in finished_sessions.order_by("phase_id", "-finished_at", "-started_at"):
            if session.phase_id not in latest_session_by_phase:
                latest_session_by_phase[session.phase_id] = session

        valid_sessions = list(latest_session_by_phase.values())

        correct_answers = sum(session.correct_answers for session in valid_sessions)
        wrong_answers = sum(session.wrong_answers for session in valid_sessions)

        total_answers = correct_answers + wrong_answers

        accuracy = (
            round((correct_answers / total_answers) * 100)
            if total_answers else 0
        )

        total_activities = StudentPhaseProgress.objects.filter(
            student=student,
            completed=True
        ).count()

        points = StudentPhaseProgress.objects.filter(
            student=student
        ).aggregate(
            total=Sum("score")
        )["total"] or 0

        continue_section = self._get_next_playable_target(student)

        contents = Content.objects.all()
        content_progress = []

        for content in contents:
            phases = Phase.objects.filter(content=content)
            total_phases = phases.count()

            completed = StudentPhaseProgress.objects.filter(
                student=student,
                phase__in=phases,
                completed=True
            ).count()

            percent = (
                round((completed / total_phases) * 100)
                if total_phases else 0
            )

            content_progress.append({
                "content": content.name,
                "progress": percent
            })

        recent_sessions = sorted(
            valid_sessions,
            key=lambda session: session.finished_at or session.started_at,
            reverse=True
        )[:3]

        recent_activities = []

        for session in recent_sessions:
            total = session.correct_answers + session.wrong_answers

            seconds = (
                int((session.finished_at - session.started_at).total_seconds())
                - session.total_paused_seconds
                if session.finished_at else 0
            )

            recent_activities.append({
                "title": f"{session.phase.content.name} - {session.phase.level.title} - Fase {session.phase.phase_number}",
                "detail": f"{session.correct_answers}/{total} acertos • {max(0, seconds)}s",
                "points": f"+{session.points_earned} pts",
                "finished_at": session.finished_at,
            })

        return Response({
            "student_name": student.full_name,
            "accuracy": accuracy,
            "points": points,
            "activities": total_activities,
            "continue_section": continue_section,
            "content_progress": content_progress,
            "recent_activities": recent_activities
        })

    def _get_next_playable_target(self, student):
        last_completed_progress = StudentPhaseProgress.objects.filter(
            student=student,
            completed=True
        ).select_related(
            "phase__content",
            "phase__level"
        ).order_by("-updated_at").first()

        if not last_completed_progress:
            first_content = Content.objects.filter(slug=self.CONTENT_ORDER[0]).first()
            first_level = Level.objects.filter(code="nivel-1").first()

            if first_content and first_level:
                return {
                    "content": first_content.name,
                    "content_slug": first_content.slug,
                    "level": first_level.title,
                    "level_code": first_level.code,
                    "phase": 1,
                }

            return {
                "content": None,
                "content_slug": None,
                "level": None,
                "level_code": None,
                "phase": None,
            }

        current_phase = last_completed_progress.phase
        current_content = current_phase.content
        current_level = current_phase.level

        next_phase_same_level = Phase.objects.filter(
            content=current_content,
            level=current_level,
            phase_number=current_phase.phase_number + 1,
            is_active=True
        ).first()

        if next_phase_same_level:
            return {
                "content": current_content.name,
                "content_slug": current_content.slug,
                "level": current_level.title,
                "level_code": current_level.code,
                "phase": next_phase_same_level.phase_number,
            }

        next_level = Level.objects.filter(
            difficulty_order=current_level.difficulty_order + 1
        ).first()

        if next_level:
            first_phase_next_level = Phase.objects.filter(
                content=current_content,
                level=next_level,
                phase_number=1,
                is_active=True
            ).first()

            if first_phase_next_level:
                first_uncompleted_phase = self._get_first_uncompleted_phase(
                    student,
                    current_content,
                    next_level
                )

                target_phase = first_uncompleted_phase or first_phase_next_level

                return {
                    "content": current_content.name,
                    "content_slug": current_content.slug,
                    "level": next_level.title,
                    "level_code": next_level.code,
                    "phase": target_phase.phase_number,
                }

        next_content = self._get_next_content(current_content.slug)

        if next_content:
            first_level = Level.objects.filter(code="nivel-1").first()

            if first_level:
                first_phase = Phase.objects.filter(
                    content=next_content,
                    level=first_level,
                    phase_number=1,
                    is_active=True
                ).first()

                if first_phase:
                    first_uncompleted_phase = self._get_first_uncompleted_phase(
                        student,
                        next_content,
                        first_level
                    )

                    target_phase = first_uncompleted_phase or first_phase

                    return {
                        "content": next_content.name,
                        "content_slug": next_content.slug,
                        "level": first_level.title,
                        "level_code": first_level.code,
                        "phase": target_phase.phase_number,
                    }

        return {
            "content": current_content.name,
            "content_slug": current_content.slug,
            "level": current_level.title,
            "level_code": current_level.code,
            "phase": current_phase.phase_number,
        }

    def _get_first_uncompleted_phase(self, student, content, level):
        phases = Phase.objects.filter(
            content=content,
            level=level,
            is_active=True
        ).order_by("phase_number")

        for phase in phases:
            completed = StudentPhaseProgress.objects.filter(
                student=student,
                phase=phase,
                completed=True
            ).exists()

            if not completed:
                return phase

        return None

    def _get_next_content(self, current_slug):
        try:
            current_index = self.CONTENT_ORDER.index(current_slug)
        except ValueError:
            return None

        if current_index + 1 >= len(self.CONTENT_ORDER):
            return None

        next_slug = self.CONTENT_ORDER[current_index + 1]
        return Content.objects.filter(slug=next_slug).first()
    
def build_progress_report_payload(request, student, period):
        summary_view = ProgressSummaryView()
        summary_response = summary_view.get(request).data

        content_progress = summary_response.get("content_progress", [])

        if content_progress:
            best_content = max(content_progress, key=lambda x: x["progress"])["content"]
            worst_content = min(content_progress, key=lambda x: x["progress"])["content"]
        else:
            best_content = "Não identificado"
            worst_content = "Não identificado"

        history = summary_response.get("history", [])
        avg_time = 0
        if history:
            total_seconds = sum(item.get("seconds", 0) for item in history)
            total_questions = sum(item.get("total", 0) for item in history)
            if total_questions > 0:
                avg_time = round(total_seconds / total_questions)

        report_data = {
            "name": student.full_name,
            "grade": student.get_school_grade_display(),
            "period": period,
            "activities": summary_response["total_activities"],
            "accuracy": summary_response["accuracy"],
            "best_content": best_content,
            "worst_content": worst_content,
            "avg_time": avg_time,
        }

        report_text = generate_student_report(report_data) or ""

        return {
            "summary": summary_response,
            "report_data": report_data,
            "report_text": report_text.strip(),
        }
    
class ProgressReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get("period", "7d")

        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Aluno não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        payload = build_progress_report_payload(request, student, period)

        return Response({
            "report": payload["report_text"]
        })

class ProgressReportPdfView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.GET.get("period", "7d")

        try:
            student = request.user.student
        except Student.DoesNotExist:
            return HttpResponse("Aluno não encontrado", status=404)

        payload = build_progress_report_payload(request, student, period)
        report_text = payload["report_text"]

        lines = [line.strip() for line in report_text.replace("**", "").split("\n")]

        while lines and not lines[0]:
            lines.pop(0)

        if lines and lines[0].lower().startswith("relatório de desempenho"):
            lines.pop(0)

        if lines and lines[0].lower().startswith("aluno:"):
            lines.pop(0)

        if lines and lines[0].lower().startswith("ano escolar:"):
            lines.pop(0)

        while lines and not lines[0]:
            lines.pop(0)

        for index, line in enumerate(lines):
            if line.lower().startswith("resumo do desempenho"):
                lines = lines[index:]
                break

        cleaned_report_text = "\n".join(lines).strip()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="relatorio-{period}.pdf"'

        pdf = canvas.Canvas(response, pagesize=A4)

        pdf.setTitle(f"Relatório de desempenho - {student.full_name}")
        pdf.setAuthor("MatFocus — Sistema de apoio pedagógico para crianças com TDAH")
        pdf.setSubject("Relatório pedagógico automático")

        width, height = A4
        margin_x = 2 * cm
        usable_width = width - 4 * cm
        bottom_margin = 2 * cm
        line_height = 14

        def draw_wrapped_text(text, x, y, max_width, font_name="Helvetica", font_size=11):
            pdf.setFillColorRGB(0.12, 0.16, 0.22)
            pdf.setFont(font_name, font_size)

            words = text.split()
            line = ""

            for word in words:
                test_line = f"{line} {word}".strip()

                if stringWidth(test_line, font_name, font_size) <= max_width:
                    line = test_line
                else:
                    pdf.drawString(x, y, line)
                    y -= line_height
                    line = word

            if line:
                pdf.drawString(x, y, line)
                y -= line_height

            return y

        pdf.setFillColorRGB(0.32, 0.52, 0.75)
        pdf.roundRect(
            margin_x,
            height - 4.2 * cm,
            usable_width,
            2.2 * cm,
            18,
            stroke=0,
            fill=1
        )

        logo_path = os.path.join(settings.BASE_DIR, "static", "img", "logo - matfocus.png")

        if os.path.exists(logo_path):
            pdf.drawImage(
                logo_path,
                margin_x + 12,
                height - 3.85 * cm,
                width=1.2 * cm,
                height=1.2 * cm,
                mask='auto'
            )

        pdf.setFillColorRGB(1, 1, 1)
        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawString(
            margin_x + 55,
            height - 3.1 * cm,
            "Relatório de desempenho"
        )

        period_map = {
            "7d": "7 dias",
            "14d": "14 dias",
            "30d": "30 dias",
        }

        pdf.setFont("Helvetica", 12)
        pdf.drawString(
            margin_x + 55,
            height - 3.7 * cm,
            f"Período analisado: últimos {period_map.get(period, period)}"
        )

        y = height - 5.5 * cm

        pdf.setFillColorRGB(0.93, 0.95, 0.98)
        pdf.roundRect(
            margin_x,
            y - 2.15 * cm,
            usable_width,
            1.95 * cm,
            14,
            stroke=0,
            fill=1
        )

        pdf.setFillColorRGB(0.12, 0.16, 0.22)

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(margin_x + 22, y - 26, "Aluno:")

        pdf.setFont("Helvetica", 12)
        pdf.drawString(margin_x + 82, y - 26, student.full_name)

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(margin_x + 22, y - 52, "Ano escolar:")

        pdf.setFont("Helvetica", 12)
        pdf.drawString(margin_x + 115, y - 52, student.get_school_grade_display())

        y -= 3.25 * cm

        pdf.setFillColorRGB(0.12, 0.16, 0.22)
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(margin_x, y, "Análise pedagógica")
        y -= 20

        text_x = margin_x + 10
        text_width = usable_width - 20

        for paragraph in cleaned_report_text.split("\n"):
            paragraph = paragraph.strip()

            if not paragraph:
                y -= 10
                continue

            if y <= bottom_margin + 30:
                pdf.showPage()
                y = height - 2.5 * cm

                pdf.setFillColorRGB(0.12, 0.16, 0.22)
                pdf.setFont("Helvetica-Bold", 13)
                pdf.drawString(margin_x, y, "Análise pedagógica (continuação)")
                y -= 20

            y = draw_wrapped_text(paragraph, text_x, y, text_width)
            y -= 6

        generated_at = datetime.now().strftime("%d/%m/%Y às %H:%M")

        pdf.setFont("Helvetica", 9)
        pdf.setFillColorRGB(0.45, 0.5, 0.6)

        pdf.drawCentredString(
            width / 2,
            1.5 * cm,
            f"Relatório gerado em {generated_at} por MatFocus"
        )

        pdf.save()
        return response