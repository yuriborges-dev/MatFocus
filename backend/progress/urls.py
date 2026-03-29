from django.urls import path
from .views import PhaseProgressDetailView, PhaseResultView, StartPhaseSessionView

urlpatterns = [
    path('phases/<int:phase_id>/', PhaseProgressDetailView.as_view(), name='phase-progress-detail'),
    path('phases/<int:phase_id>/result/', PhaseResultView.as_view(), name='phase-result'),
    path('phases/<int:phase_id>/start-session/', StartPhaseSessionView.as_view(), name='start-phase-session'),
]