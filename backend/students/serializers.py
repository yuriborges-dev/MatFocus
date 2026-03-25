from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Student


class StudentRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=4)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'full_name',
            'age',
            'sex',
            'school_grade',
            'guardian_name',
            'username',
            'password',
            'confirm_password',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {'confirm_password': 'As senhas não coincidem.'}
            )

        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError(
                {'username': 'Este nome de usuário já está em uso.'}
            )

        return attrs

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')

        user = User.objects.create_user(
            username=username,
            password=password,
        )

        student = Student.objects.create(
            user=user,
            **validated_data
        )

        return student

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'full_name': instance.full_name,
            'age': instance.age,
            'sex': instance.sex,
            'school_grade': instance.school_grade,
            'guardian_name': instance.guardian_name,
            'username': instance.user.username,
        }