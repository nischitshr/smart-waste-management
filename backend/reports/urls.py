from django.urls import path
from .views import DumpingReportListCreateView, DumpingReportDetailView, AdminReportStatusUpdateView

urlpatterns = [
    path('', DumpingReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>/', DumpingReportDetailView.as_view(), name='report-detail'),
    path('<int:pk>/update-status/', AdminReportStatusUpdateView.as_view(), name='report-update-status'),
]