from django.utils import timezone
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import DumpingReport


class DumpingReportSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = DumpingReport
        geo_field = 'location'
        fields = ['id', 'reported_by', 'ward', 'title', 'description',
          'photo', 'status', 'created_at', 'resolved_at']
        read_only_fields = ['reported_by', 'ward', 'status']


class AdminReportStatusSerializer(serializers.ModelSerializer):
    """Admin-only: update status, auto-stamps resolved_at when marked resolved."""
    class Meta:
        model = DumpingReport
        fields = ['id', 'status', 'resolved_at']
        read_only_fields = ['id', 'resolved_at']

    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        if new_status == 'resolved' and instance.status != 'resolved':
            instance.resolved_at = timezone.now()
        elif new_status != 'resolved':
            instance.resolved_at = None
        instance.status = new_status
        instance.save()
        return instance