from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.contrib.auth.models import User
from .models import PasswordResetCode
from django.core.mail import send_mail
from django.conf import settings

from .serializers import (
    RegisterSerializer,
    StudentMeSerializer,
    LoginSerializer,
    StudentUpdateSerializer,
    RequestPasswordResetSerializer,
    VerifyPasswordResetCodeSerializer,
    ResetPasswordSerializer,
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

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Se este e-mail estiver cadastrado, um código será enviado."},
                status=status.HTTP_200_OK,
            )

        PasswordResetCode.objects.filter(user=user, used=False).update(used=True)

        code = str(random.randint(100000, 999999))

        PasswordResetCode.objects.create(
            user=user,
            code=code,
        )

        send_mail(
            subject="Código de recuperação de senha - MatFocus",
            message=(
                f"Olá!\n\n"
                f"Seu código de recuperação de senha do MatFocus é: {code}\n\n"
                f"Este código é válido por 10 minutos.\n\n"
                f"Se você não solicitou a recuperação de senha, ignore este e-mail."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {"detail": "Se este e-mail estiver cadastrado, um código será enviado."},
            status=status.HTTP_200_OK,
        )


class VerifyPasswordResetCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyPasswordResetCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Código inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_code = (
            PasswordResetCode.objects.filter(
                user=user,
                code=code,
                used=False,
            )
            .order_by("-created_at")
            .first()
        )

        if not reset_code or reset_code.is_expired():
            return Response(
                {"detail": "Código inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Código validado com sucesso."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Código inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_code = (
            PasswordResetCode.objects.filter(
                user=user,
                code=code,
                used=False,
            )
            .order_by("-created_at")
            .first()
        )

        if not reset_code or reset_code.is_expired():
            return Response(
                {"detail": "Código inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save()

        reset_code.used = True
        reset_code.save()

        return Response(
            {"detail": "Senha redefinida com sucesso."},
            status=status.HTTP_200_OK,
        )