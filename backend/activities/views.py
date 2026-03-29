from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from students.models import Student
from progress.models import StudentPhaseProgress, StudentAnswer, StudentPhaseSession

from .models import Content, Level, Phase, Question
from .serializers import (
    ContentSerializer,
    LevelSerializer,
    PhaseSerializer,
    QuestionSerializer,
    SubmitAnswerSerializer,
)
from .utils import is_answer_correct


class ContentListView(generics.ListAPIView):
    queryset = Content.objects.all().order_by('name')
    serializer_class = ContentSerializer


class LevelListView(generics.ListAPIView):
    queryset = Level.objects.all().order_by('difficulty_order')
    serializer_class = LevelSerializer


class PhaseListView(generics.ListAPIView):
    serializer_class = PhaseSerializer

    def get_queryset(self):
        queryset = Phase.objects.select_related('content', 'level').all()

        content_slug = self.request.query_params.get('content')
        level_code = self.request.query_params.get('level')

        if content_slug:
            queryset = queryset.filter(content__slug=content_slug)

        if level_code:
            queryset = queryset.filter(level__code=level_code)

        return queryset.order_by('phase_number')


class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = Question.objects.select_related('phase').all()

        phase_id = self.request.query_params.get('phase_id')

        if phase_id:
            queryset = queryset.filter(phase_id=phase_id)

        return queryset.order_by('order')


class SubmitAnswerView(APIView):
    def post(self, request, question_id):
        try:
            question = Question.objects.select_related('phase').get(pk=question_id)
        except Question.DoesNotExist:
            return Response(
                {'detail': 'Questão não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_id = serializer.validated_data['student_id']
        session_id = serializer.validated_data['session_id']
        submitted_answer = serializer.validated_data['answer']

        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            session = StudentPhaseSession.objects.get(
                pk=session_id,
                student=student,
                phase=question.phase
            )
        except StudentPhaseSession.DoesNotExist:
            return Response(
                {'detail': 'Sessão da fase não encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if session.is_finished:
            return Response(
                {'detail': 'Essa sessão já foi finalizada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        correct = is_answer_correct(submitted_answer, question.correct_answer)

        already_correct_in_session = StudentAnswer.objects.filter(
            student=student,
            question=question,
            session=session,
            is_correct=True
        ).exists()

        already_correct_in_phase = StudentAnswer.objects.filter(
            student=student,
            question=question,
            is_correct=True
        ).exists()

        StudentAnswer.objects.create(
            student=student,
            question=question,
            session=session,
            answer_given=submitted_answer,
            is_correct=correct
        )

        phase_progress, _ = StudentPhaseProgress.objects.get_or_create(
            student=student,
            phase=question.phase
        )

        earned_points = 0
        counted_as_new_correct = False

        if correct and not already_correct_in_session:
            session.correct_answers += 1
            counted_as_new_correct = True

            if not already_correct_in_phase:
                phase_progress.score += 10
                earned_points = 10

        elif not correct:
            session.wrong_answers += 1

        correct_question_ids_in_session = StudentAnswer.objects.filter(
            student=student,
            session=session,
            question__phase=question.phase,
            is_correct=True
        ).values_list('question_id', flat=True).distinct()

        total_questions = question.phase.questions.count()

        phase_completed_now = False

        if len(correct_question_ids_in_session) == total_questions and total_questions > 0:
            session.is_finished = True

            if not session.finished_at:
                from django.utils import timezone
                session.finished_at = timezone.now()

            phase_completed_now = True

            if not phase_progress.completed:
                phase_progress.completed = True

        phase_progress.save()
        session.save()

        return Response({
            'question_id': question.id,
            'student_id': student.id,
            'phase_id': question.phase.id,
            'session_id': session.id,
            'is_correct': correct,
            'feedback': 'Resposta correta! Muito bem.' if correct else 'Resposta incorreta. Tente novamente.',
            'correct_answer': None if correct else question.correct_answer,
            'tip': None if correct else question.tip,
            'phase_completed': phase_progress.completed,
            'phase_completed_now': phase_completed_now,
            'session_finished': session.is_finished,
            'score': phase_progress.score,
            'correct_answers': session.correct_answers,
            'wrong_answers': session.wrong_answers,
            'already_correct_before': already_correct_in_session,
            'counted_as_new_correct': counted_as_new_correct,
            'earned_points': earned_points,
        }, status=status.HTTP_200_OK)