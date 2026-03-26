from rest_framework import generics
from .models import Content, Level, Phase, Question
from .serializers import (ContentSerializer, LevelSerializer, PhaseSerializer, QuestionSerializer,)


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