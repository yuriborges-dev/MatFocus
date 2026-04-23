from django.urls import path
from .views import PhaseProgressDetailView, PhaseResultView, StartPhaseSessionView, PhaseMapStatusView, LevelProgressSummaryView, ProgressSummaryView, DashboardSummaryView, ProgressReportView, ProgressReportPdfView, PausePhaseSessionView, ResumePhaseSessionView

urlpatterns = [
    path('phases/<int:phase_id>/', PhaseProgressDetailView.as_view(), name='phase-progress-detail'),
    path('phases/<int:phase_id>/result/', PhaseResultView.as_view(), name='phase-result'),
    path('phases/<int:phase_id>/start-session/', StartPhaseSessionView.as_view(), name='start-phase-session'),
    path('phase-map/', PhaseMapStatusView.as_view(), name='phase-map-status'),
    path('level-progress/', LevelProgressSummaryView.as_view(), name='level-progress'),
    path("summary/", ProgressSummaryView.as_view(), name="progress-summary"),
    path("dashboard/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("report/", ProgressReportView.as_view(), name="progress-report"),
    path("report/pdf/", ProgressReportPdfView.as_view(), name="progress-report-pdf"),
    path('phases/<int:phase_id>/pause-session/', PausePhaseSessionView.as_view(), name='pause-phase-session'),
    path('phases/<int:phase_id>/resume-session/', ResumePhaseSessionView.as_view(), name='resume-phase-session'),
]