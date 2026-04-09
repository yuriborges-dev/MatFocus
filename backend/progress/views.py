from django.db.models import Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta
from django.db.models import Count

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
    def get(self, request, phase_id):
        student_id = request.query_params.get('student_id')

        if not student_id:
            return Response(
                {'detail': 'student_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(pk=student_id)
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

        previous_progress = StudentPhaseProgress.objects.filter(
            student=student,
            phase=previous_phase,
            completed=True
        ).exists()

        return previous_progress


class PhaseResultView(APIView):
    def get(self, request, phase_id):
        student_id = request.query_params.get('student_id')
        session_id = request.query_params.get('session_id')

        if not student_id:
            return Response(
                {'detail': 'student_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(pk=student_id)
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
    def post(self, request, phase_id):
        student_id = request.data.get('student_id')

        if not student_id:
            return Response(
                {'detail': 'student_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(pk=student_id)
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

        session = StudentPhaseSession.objects.create(
            student=student,
            phase=phase
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
        }

        serializer = PhaseSessionSerializer(data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PhaseMapStatusView(APIView):
    def get(self, request):
        student_id = request.query_params.get('student_id')
        content_slug = request.query_params.get('content')
        level_code = request.query_params.get('level')

        if not student_id:
            return Response(
                {'detail': 'student_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not content_slug or not level_code:
            return Response(
                {'detail': 'content e level são obrigatórios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(pk=student_id)
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
    def get(self, request):
        student_id = request.query_params.get('student_id')
        content_slug = request.query_params.get('content')

        if not student_id:
            return Response(
                {'detail': 'student_id é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not content_slug:
            return Response(
                {'detail': 'content é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(pk=student_id)
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
    def get(self, request):
        student_id = request.query_params.get("student_id")
        period = request.query_params.get("period", "all")

        if not student_id:
            return Response(
                {"detail": "student_id é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(pk=student_id)
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

        answers = StudentAnswer.objects.filter(student=student)

        if start_date:
            answers = answers.filter(answered_at__gte=start_date)

        correct_answers = answers.filter(is_correct=True).count()
        wrong_answers = answers.filter(is_correct=False).count()

        total_answers = correct_answers + wrong_answers

        accuracy = (
            round((correct_answers / total_answers) * 100)
            if total_answers > 0 else 0
        )

        activities = StudentPhaseSession.objects.filter(
            student=student,
            is_finished=True
        )

        if start_date:
            activities = activities.filter(started_at__gte=start_date)

        total_activities = activities.count()

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
                if total_phases > 0 else 0
            )

            content_progress.append({
                "content": content.name,
                "progress": progress_percent
            })

        history_sessions = StudentPhaseSession.objects.filter(
            student=student,
            is_finished=True
        ).select_related("phase__content", "phase__level")[:5]

        history = []

        for session in history_sessions:
            total = session.correct_answers + session.wrong_answers

            history.append({
                "title": f"{session.phase.content.name} - {session.phase.level.title}",
                "correct": session.correct_answers,
                "total": total,
                "seconds": (
                    int((session.finished_at - session.started_at).total_seconds())
                    if session.finished_at else 0
                )
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
    CONTENT_ORDER = ["adicao", "subtracao", "multiplicacao", "divisao", "problemas"]

    def get(self, request):
        student_id = request.query_params.get("student_id")

        if not student_id:
            return Response(
                {"detail": "student_id é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student = Student.objects.get(pk=student_id)

        answers = StudentAnswer.objects.filter(student=student)

        correct_answers = answers.filter(is_correct=True).count()
        wrong_answers = answers.filter(is_correct=False).count()

        total_answers = correct_answers + wrong_answers

        accuracy = (
            round((correct_answers / total_answers) * 100)
            if total_answers > 0 else 0
        )

        activities = StudentPhaseSession.objects.filter(
            student=student,
            is_finished=True
        )

        total_activities = activities.count()

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

        recent_sessions = activities[:3]

        recent_activities = []

        for session in recent_sessions:
            total = session.correct_answers + session.wrong_answers

            recent_activities.append({
                "title": session.phase.content.name,
                "detail": f"{session.phase.level.title} • {session.correct_answers}/{total} acertos",
                "points": f"+{session.correct_answers * 10} pts"
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