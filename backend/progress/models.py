from django.db import models
from students.models import Student
from activities.models import Phase, Question


class StudentPhaseProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='phase_progress')
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, related_name='student_progress')
    completed = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    average_time_seconds = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'phase')

    def __str__(self):
        return f'{self.student} - {self.phase}'


class StudentPhaseSession(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='phase_sessions')
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, related_name='sessions')
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    points_earned = models.PositiveIntegerField(default=0)
    total_paused_seconds = models.PositiveIntegerField(default=0)
    paused_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    is_finished = models.BooleanField(default=False)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.student} - {self.phase} - Sessão {self.id}'


class StudentAnswer(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers')
    session = models.ForeignKey(
        StudentPhaseSession,
        on_delete=models.CASCADE,
        related_name='answers',
        null=True,
        blank=True
    )
    answer_given = models.CharField(max_length=100)
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.student} - Questão {self.question.id}'