from rest_framework import serializers
from .models import Content, Level, Phase, Question


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'name', 'slug', 'description']


class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'code', 'title', 'difficulty_order']


class PhaseSerializer(serializers.ModelSerializer):
    content_name = serializers.CharField(source='content.name', read_only=True)
    level_code = serializers.CharField(source='level.code', read_only=True)
    level_title = serializers.CharField(source='level.title', read_only=True)

    class Meta:
        model = Phase
        fields = [
            'id',
            'phase_number',
            'is_active',
            'content',
            'level',
            'content_name',
            'level_code',
            'level_title',
        ]


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'phase', 'statement', 'tip', 'order']

class SubmitAnswerSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    answer = serializers.CharField(max_length=100)