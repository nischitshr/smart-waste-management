from django.shortcuts import render
from rest_framework import generics, permissions
from .models import PickupRequest
from .serializers import PickupRequestSerializer, DriverPickupStatusSerializer, AssignDriverSerializer
from users.permissions import IsAdmin
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate
from datetime import timedelta

class PickupRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = PickupRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PickupRequest.objects.all()
        elif user.role == 'driver':
            return PickupRequest.objects.filter(assigned_driver=user)
        return PickupRequest.objects.filter(requested_by=user)

    def perform_create(self, serializer):
        bin_obj = serializer.validated_data.get('bin')
        # If a bin was selected, auto-fill address from it; otherwise fall back to manual address
        address = bin_obj.address if bin_obj else serializer.validated_data.get('address', '')
        serializer.save(requested_by=self.request.user, ward=self.request.user.ward, address=address)


class PickupRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PickupRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return PickupRequest.objects.all()
        elif user.role == 'driver':
            return PickupRequest.objects.filter(assigned_driver=user)
        return PickupRequest.objects.filter(requested_by=user)


class DriverPickupStatusUpdateView(generics.UpdateAPIView):
    serializer_class = DriverPickupStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PickupRequest.objects.filter(assigned_driver=self.request.user)


class PickupAssignDriverView(generics.UpdateAPIView):
    serializer_class = AssignDriverSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = PickupRequest.objects.all()
    


class DriverPickupStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'driver':
            return Response({'detail': 'Not a driver.'}, status=403)

        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())  # Monday
        window_start = today - timedelta(days=13)  # last 14 days incl. today

        base_qs = PickupRequest.objects.filter(assigned_driver=user)

        total_completed = base_qs.filter(status='completed').count()
        completed_this_week = base_qs.filter(
            status='completed', updated_at__date__gte=week_start
        ).count()
        today_count = base_qs.filter(scheduled_date=today).exclude(status='cancelled').count()
        upcoming_count = base_qs.filter(
            scheduled_date__gt=today
        ).exclude(status__in=['completed', 'cancelled']).count()

        daily_qs = (
            base_qs.filter(status='completed', updated_at__date__gte=window_start)
            .annotate(day=TruncDate('updated_at'))
            .values('day')
            .annotate(completed=Count('id'))
        )
        daily_map = {entry['day'].isoformat(): entry['completed'] for entry in daily_qs}

        daily_activity = [
            {
                'date': (today - timedelta(days=i)).isoformat(),
                'completed': daily_map.get((today - timedelta(days=i)).isoformat(), 0),
            }
            for i in range(13, -1, -1)
        ]

        return Response({
            'total_completed': total_completed,
            'completed_this_week': completed_this_week,
            'today_count': today_count,
            'upcoming_count': upcoming_count,
            'daily_activity': daily_activity,
        })