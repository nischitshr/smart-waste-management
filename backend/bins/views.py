from django.shortcuts import render
from rest_framework import generics, permissions
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance
from .models import WasteBin
from .serializers import WasteBinSerializer
from users.permissions import IsAdmin


class WasteBinListView(generics.ListAPIView):
    serializer_class = WasteBinSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = WasteBin.objects.filter(status='active')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        if lat and lng:
            user_location = Point(float(lng), float(lat), srid=4326)
            # NOTE: ST_DistanceSphere (used under the hood by distance_lte on a
            # geography-backed PointField) returns meters, not degrees.
            # Use D(m=...) explicitly so the unit is never ambiguous again.
            radius = D(m=1500)  # 1.5km radius, adjust as needed
            queryset = queryset.filter(
                location__distance_lte=(user_location, radius)
            ).annotate(distance=Distance('location', user_location)).order_by('distance')
        return queryset

class WasteBinDetailView(generics.RetrieveAPIView):
    serializer_class = WasteBinSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = WasteBin.objects.all()
    
class WasteBinAdminListCreateView(generics.ListCreateAPIView):
    serializer_class = WasteBinSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = WasteBin.objects.all()


class WasteBinAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WasteBinSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = WasteBin.objects.all()
    
    
class WasteBinDriverListView(generics.ListAPIView):
    serializer_class = WasteBinSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'driver':
            return WasteBin.objects.none()
        if not user.ward:
            return WasteBin.objects.none()
        return WasteBin.objects.filter(ward=user.ward, status='active').order_by('-fill_level')