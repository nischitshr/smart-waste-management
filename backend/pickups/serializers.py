from bins.models import WasteBin  # adjust if needed
from rest_framework import serializers
from .models import PickupRequest
from notifications.models import Notification

class BinMiniSerializer(serializers.ModelSerializer):
    """Lightweight bin info for displaying inside a pickup request."""
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = WasteBin
        fields = ['id', 'address', 'waste_type', 'latitude', 'longitude']

    def get_latitude(self, obj):
        return obj.location.y if obj.location else None

    def get_longitude(self, obj):
        return obj.location.x if obj.location else None


class PickupRequestSerializer(serializers.ModelSerializer):
    bin_detail = BinMiniSerializer(source='bin', read_only=True)
    bin = serializers.PrimaryKeyRelatedField(queryset=WasteBin.objects.all(), required=False, allow_null=True)

    class Meta:
        model = PickupRequest
        fields = ['id', 'requested_by', 'assigned_driver', 'ward', 'bin', 'bin_detail',
                  'address', 'scheduled_date', 'status', 'notes', 'created_at']
        read_only_fields = ['requested_by', 'assigned_driver', 'ward', 'status']


class DriverPickupStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupRequest
        fields = ['id', 'status', 'notes']
        read_only_fields = ['id']


class AssignDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupRequest
        fields = ['id', 'assigned_driver', 'status']
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        old_driver_id = instance.assigned_driver_id
        instance = super().update(instance, validated_data)

        new_driver = instance.assigned_driver
        if new_driver and new_driver.id != old_driver_id:
            Notification.objects.create(
                recipient=new_driver,
                message=f'You have been assigned a pickup at "{instance.address}".',
                link=f'/driver/pickups/{instance.id}',
            )
        return instance