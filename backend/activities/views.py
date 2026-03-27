from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from students.models import Student
from progress.models import StudentPhaseProgress, StudentAnswer

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
        submitted_answer = serializer.validated_data['answer']

        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            return Response(
                {'detail': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        correct = is_answer_correct(submitted_answer, question.correct_answer)

        StudentAnswer.objects.create(
            student=student,
            question=question,
            answer_given=submitted_answer,
            is_correct=correct
        )

        phase_progress, _ = StudentPhaseProgress.objects.get_or_create(
            student=student,
            phase=question.phase
        )

        already_correct = StudentAnswer.objects.filter(
            student=student,
            question=question,
            is_correct=True
        ).exists()

        if correct and not already_correct:
            phase_progress.correct_answers += 1
            phase_progress.score += 10

        elif not correct:
            phase_progress.wrong_answers += 1
            total_questions = question.phase.questions.count()

        correct_question_ids = StudentAnswer.objects.filter(
            student=student,
            question__phase=question.phase,
            is_correct=True
        ).values_list('question_id', flat=True).distinct()

        total_questions = question.phase.questions.count()

        if len(correct_question_ids) == total_questions and total_questions > 0:
            phase_progress.completed = True

        phase_progress.save()

        return Response({
            'question_id': question.id,
            'student_id': student.id,
            'phase_id': question.phase.id,
            'is_correct': correct,
            'feedback': 'Resposta correta! Muito bem.' if correct else 'Resposta incorreta. Tente novamente.',
            'correct_answer': None if correct else question.correct_answer,
            'tip': None if correct else question.tip,
            'phase_completed': phase_progress.completed,
            'score': phase_progress.score,
            'correct_answers': phase_progress.correct_answers,
            'wrong_answers': phase_progress.wrong_answers,
        }, status=status.HTTP_200_OK)