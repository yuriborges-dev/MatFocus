from django.urls import path
from .views import PhaseProgressDetailView, PhaseResultView

urlpatterns = [
    path('phases/<int:phase_id>/', PhaseProgressDetailView.as_view(), name='phase-progress-detail'),
    path('phases/<int:phase_id>/result/', PhaseResultView.as_view(), name='phase-result'),
]