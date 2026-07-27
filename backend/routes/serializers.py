from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Vehicle, CollectionRoute, GPSTrack

class VehicleSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.username', read_only=True, default=None)

    class Meta:
        model = Vehicle
        fields = ['id', 'driver', 'driver_name', 'plate_number', 'capacity_tons', 'status']

class GPSTrackSerializer(GeoFeatureModelSerializer):
    plate_number = serializers.CharField(source='vehicle.plate_number', read_only=True, default=None)

    class Meta:
        model = GPSTrack
        geo_field = 'location'
        fields = ['id', 'vehicle', 'plate_number', 'location', 'recorded_at']

class CollectionRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionRoute
        fields = ['id', 'vehicle', 'bins', 'date', 'is_optimized', 'created_at']