from django.shortcuts import render
from rest_framework import generics, permissions
from django.contrib.gis.geos import Point
from users.models import Ward
from users.permissions import IsAdmin
from .models import DumpingReport
from .serializers import DumpingReportSerializer, AdminReportStatusSerializer


class DumpingReportListCreateView(generics.ListCreateAPIView):
    serializer_class = DumpingReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return DumpingReport.objects.all()
        elif user.role == 'driver':
            return DumpingReport.objects.filter(ward=user.ward)
        return DumpingReport.objects.filter(reported_by=user)

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user, ward=self.request.user.ward)


class DumpingReportDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DumpingReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return DumpingReport.objects.all()
        elif user.role == 'driver':
            return DumpingReport.objects.filter(ward=user.ward)
        return DumpingReport.objects.filter(reported_by=user)


class AdminReportStatusUpdateView(generics.UpdateAPIView):
    serializer_class = AdminReportStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = DumpingReport.objects.all()