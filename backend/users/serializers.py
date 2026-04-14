from django.contrib.auth.models import User
from rest_framework import serializers
from students.models import Student


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    age = serializers.IntegerField(min_value=1)
    sex = serializers.ChoiceField(choices=Student.SEX_CHOICES)
    school_grade = serializers.ChoiceField(choices=Student.GRADE_CHOICES)
    guardian_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "As senhas não coincidem."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        password = validated_data.pop("password")
        username = validated_data.pop("username")

        user = User.objects.create_user(
            username=username,
            password=password,
        )

        student = Student.objects.create(
            user=user,
            **validated_data,
        )

        return student


class StudentMeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")

    class Meta:
        model = Student
        fields = [
            "id",
            "username",
            "full_name",
            "age",
            "sex",
            "school_grade",
            "guardian_name",
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)