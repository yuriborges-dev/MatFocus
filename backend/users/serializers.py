from django.contrib.auth.models import User
from rest_framework import serializers
from students.models import Student
from django.contrib.auth.models import User

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
    profile_photo = serializers.SerializerMethodField()

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
            "profile_photo",
        ]

    def get_profile_photo(self, obj):
        request = self.context.get("request")
        if obj.profile_photo:
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class StudentUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    profile_photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Student
        fields = [
            "username",
            "full_name",
            "age",
            "sex",
            "school_grade",
            "guardian_name",
            "password",
            "profile_photo",
        ]

    def validate_username(self, value):
        user = self.instance.user
        if User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        password = validated_data.pop("password", None)
        profile_photo = validated_data.pop("profile_photo", serializers.empty)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if profile_photo is not serializers.empty:
            instance.profile_photo = profile_photo

        instance.save()

        username = user_data.get("username")
        if username is not None:
            instance.user.username = username

        if password:
            instance.user.set_password(password)

        instance.user.save()
        return instance