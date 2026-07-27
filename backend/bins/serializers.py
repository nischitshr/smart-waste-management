from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import WasteBin

class WasteBinSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = WasteBin
        geo_field = 'location'
        fields = ['id', 'ward', 'address', 'waste_type', 
                  'fill_level', 'status', 'last_collected', 'is_high_priority']