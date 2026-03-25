from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    SEX_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Feminino'),
        ('O', 'Outro'),
    ]

    GRADE_CHOICES = [
        ('3', '3º ano'),
        ('4', '4º ano'),
        ('5', '5º ano'),
        ('6', '6º ano'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    full_name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    school_grade = models.CharField(max_length=2, choices=GRADE_CHOICES)
    guardian_name = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name