from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import WasteBin


@admin.register(WasteBin)
class WasteBinAdmin(GISModelAdmin):
    list_display = ('id', 'address', 'ward', 'waste_type', 'fill_level', 'status', 'is_high_priority')
    list_filter = ('status', 'waste_type', 'ward')
    search_fields = ('address',)
    gis_widget_kwargs = {
        'attrs': {
            'default_lon': 85.3240,   # Kathmandu Ward 15 approx longitude
            'default_lat': 27.7172,   # Kathmandu Ward 15 approx latitude
            'default_zoom': 14,
        }
    }