from django.utils import timezone
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import DumpingReport
from notifications.models import Notification


class DumpingReportSerializer(GeoFeatureModelSerializer):
    reported_by_username = serializers.SerializerMethodField()
    ward_name = serializers.SerializerMethodField()

    class Meta:
        model = DumpingReport
        geo_field = 'location'
        fields = ['id', 'reported_by', 'reported_by_username', 'ward', 'ward_name',
                  'title', 'description', 'photo', 'status', 'created_at', 'resolved_at']
        read_only_fields = ['reported_by', 'ward', 'status']

    def get_reported_by_username(self, obj):
        return obj.reported_by.username if obj.reported_by else None

    def get_ward_name(self, obj):
        return obj.ward.name if obj.ward else None


class AdminReportStatusSerializer(serializers.ModelSerializer):
    """Admin-only: update status, auto-stamps resolved_at when marked resolved."""
    class Meta:
        model = DumpingReport
        fields = ['id', 'status', 'resolved_at']
        read_only_fields = ['id', 'resolved_at']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        status_changed = new_status != instance.status
        if new_status == 'resolved' and instance.status != 'resolved':
            instance.resolved_at = timezone.now()
        elif new_status != 'resolved':
            instance.resolved_at = None
        instance.status = new_status
        instance.save()

        if status_changed and instance.reported_by:
            Notification.objects.create(
                recipient=instance.reported_by,
                message=f'Your report "{instance.title}" is now {new_status}.',
                link=f'/reports?highlight={instance.id}',
            )
        return instance
    
