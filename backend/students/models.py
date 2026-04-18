from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    SEX_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
    ]

    GRADE_CHOICES = [
        ('3', '3º ano'),
        ('4', '4º ano'),
        ('5', '5º ano'),
        ('6', '6º ano'),
    ]

    INTENSITY_CHOICES = [
        ('baixo', 'Baixo'),
        ('medio', 'Médio'),
        ('alto', 'Alto'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    full_name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    school_grade = models.CharField(max_length=2, choices=GRADE_CHOICES)
    guardian_name = models.CharField(max_length=150)

    sound_level = models.CharField(
        max_length=10,
        choices=INTENSITY_CHOICES,
        default='medio'
    )
    animation_level = models.CharField(
        max_length=10,
        choices=INTENSITY_CHOICES,
        default='medio'
    )
    break_suggestions_enabled = models.BooleanField(default=True)
    break_interval_minutes = models.PositiveIntegerField(default=20)

    created_at = models.DateTimeField(auto_now_add=True)
    profile_photo = models.ImageField(
        upload_to="profile_photos/",
        null=True,
        blank=True
    )

    def __str__(self):
        return self.full_name