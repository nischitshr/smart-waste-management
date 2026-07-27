from django.urls import path
from .views import (
    VehicleListView,
    CollectionRouteListView,
    GPSTrackCreateView,
    VehicleLatestLocationsView,
)

urlpatterns = [
    path('vehicles/', VehicleListView.as_view()),
    path('collections/', CollectionRouteListView.as_view()),
    path('gps/', GPSTrackCreateView.as_view()),
    path('gps/latest/', VehicleLatestLocationsView.as_view()),
]