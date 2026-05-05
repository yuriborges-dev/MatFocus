from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    MeView,
    RequestPasswordResetView,
    VerifyPasswordResetCodeView,
    ResetPasswordView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("password-reset/request/", RequestPasswordResetView.as_view(), name="password-reset-request"),
    path("password-reset/verify/", VerifyPasswordResetCodeView.as_view(), name="password-reset-verify"),
    path("password-reset/confirm/", ResetPasswordView.as_view(), name="password-reset-confirm"),
]