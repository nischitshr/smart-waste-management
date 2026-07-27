from django.shortcuts import render
from django.db.models import Max
from rest_framework import generics, permissions
from .models import Vehicle, CollectionRoute, GPSTrack
from .serializers import VehicleSerializer, CollectionRouteSerializer, GPSTrackSerializer

class VehicleListView(generics.ListAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Vehicle.objects.all()

class CollectionRouteListView(generics.ListAPIView):
    serializer_class = CollectionRouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'driver':
            return CollectionRoute.objects.filter(vehicle__driver=user)
        return CollectionRoute.objects.all()

class GPSTrackCreateView(generics.CreateAPIView):
    serializer_class = GPSTrackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        vehicle = self.request.user.vehicle
        serializer.save(vehicle=vehicle)

class VehicleLatestLocationsView(generics.ListAPIView):
    """Returns each vehicle's most recent GPS point, for the admin tracking map."""
    serializer_class = GPSTrackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        latest_ids = (
            GPSTrack.objects.values('vehicle')
            .annotate(latest_id=Max('id'))
            .values_list('latest_id', flat=True)
        )
        return GPSTrack.objects.filter(id__in=latest_ids).select_related('vehicle')