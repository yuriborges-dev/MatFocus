from django.db import models


class Content(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name


class Level(models.Model):
    LEVEL_CHOICES = [
        ('nivel-1', 'Nível 1'),
        ('nivel-2', 'Nível 2'),
        ('nivel-3', 'Nível 3'),
        ('nivel-4', 'Nível 4'),
    ]

    code = models.CharField(max_length=20, choices=LEVEL_CHOICES, unique=True)
    title = models.CharField(max_length=50)
    difficulty_order = models.PositiveIntegerField(unique=True)

    def __str__(self):
        return self.title


class Phase(models.Model):
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='phases')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='phases')
    phase_number = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('content', 'level', 'phase_number')
        ordering = ['phase_number']

    def __str__(self):
        return f'{self.content.name} - {self.level.title} - Fase {self.phase_number}'


class Question(models.Model):
    phase = models.ForeignKey(Phase, on_delete=models.CASCADE, related_name='questions')
    statement = models.TextField()
    correct_answer = models.CharField(max_length=100)
    tip = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'Questão {self.order} - {self.phase}'