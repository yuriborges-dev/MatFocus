from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    StudentMeSerializer,
    LoginSerializer,
    StudentUpdateSerializer,
)

from students.models import Student


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = serializer.save()
        tokens = get_tokens_for_user(student.user)

        return Response(
            {
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "student": StudentMeSerializer(student).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"detail": "Usuário ou senha inválidos."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            student = user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Aluno não encontrado para este usuário."},
                status=status.HTTP_404_NOT_FOUND,
            )

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "student": StudentMeSerializer(student).data,
            }
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Aluno não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(StudentMeSerializer(student, context={"request": request}).data)

    def patch(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Aluno não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = StudentUpdateSerializer(
            student,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

        return Response(StudentMeSerializer(student, context={"request": request}).data)