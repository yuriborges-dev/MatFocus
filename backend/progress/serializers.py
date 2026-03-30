from rest_framework import serializers


class PhaseProgressDetailSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    phase_id = serializers.IntegerField()
    completed = serializers.BooleanField()
    score = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    wrong_answers = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    answered_correctly_count = serializers.IntegerField()
    is_unlocked = serializers.BooleanField()
    next_phase_id = serializers.IntegerField(allow_null=True)
    next_phase_unlocked = serializers.BooleanField()


class PhaseResultSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    phase_id = serializers.IntegerField()
    phase_number = serializers.IntegerField()
    content_slug = serializers.CharField()
    content_title = serializers.CharField()
    level_code = serializers.CharField()
    level_title = serializers.CharField()
    completed = serializers.BooleanField()
    score = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    wrong_answers = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    accuracy = serializers.IntegerField()
    time_spent_seconds = serializers.IntegerField()
    next_phase_id = serializers.IntegerField(allow_null=True)
    next_phase_number = serializers.IntegerField(allow_null=True)
    next_phase_unlocked = serializers.BooleanField()


class PhaseSessionSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
    phase_id = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    wrong_answers = serializers.IntegerField()
    is_finished = serializers.BooleanField()
    started_at = serializers.DateTimeField()
    finished_at = serializers.DateTimeField(allow_null=True)


class PhaseMapItemSerializer(serializers.Serializer):
    phase_id = serializers.IntegerField()
    phase_number = serializers.IntegerField()
    is_active = serializers.BooleanField()
    is_unlocked = serializers.BooleanField()
    is_completed = serializers.BooleanField()
    score = serializers.IntegerField()
    total_questions = serializers.IntegerField()