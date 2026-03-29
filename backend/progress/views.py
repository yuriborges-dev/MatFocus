from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from students.models import Student
from activities.models import Phase, Content, Level
from .models import StudentPhaseProgress, StudentAnswer, StudentPhaseSession
from .serializers import (
    PhaseProgressDetailSerializer,
    PhaseResultSerializer,
    PhaseSessionSerializer,
    PhaseMapItemSerializer,
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

        total_questions = phase.questions.count()

        accuracy = 0
        if total_questions > 0:
            accuracy = round((session_correct_answers / total_questions) * 100)

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
            'average_time_seconds': phase_progress.average_time_seconds,
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