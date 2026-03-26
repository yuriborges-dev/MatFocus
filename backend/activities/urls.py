from django.urls import path
from .views import (ContentListView, LevelListView, PhaseListView, QuestionListView,)

urlpatterns = [
    path('contents/', ContentListView.as_view(), name='content-list'),
    path('levels/', LevelListView.as_view(), name='level-list'),
    path('phases/', PhaseListView.as_view(), name='phase-list'),
    path('questions/', QuestionListView.as_view(), name='question-list'),
]