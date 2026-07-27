from django.contrib import admin
from .models import Vehicle, CollectionRoute, GPSTrack

admin.site.register(Vehicle)
admin.site.register(CollectionRoute)
admin.site.register(GPSTrack)