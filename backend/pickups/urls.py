from django.urls import path
from .views import (
    PickupRequestListCreateView,
    PickupRequestDetailView,
    DriverPickupStatusUpdateView,
    PickupAssignDriverView,
    DriverPickupStatsView,   # add this import
)

urlpatterns = [
    path('driver/stats/', DriverPickupStatsView.as_view()),   # add this line — must sit above '<int:pk>/'? No conflict, but keep it here for clarity
    path('', PickupRequestListCreateView.as_view()),
    path('<int:pk>/', PickupRequestDetailView.as_view()),
    path('<int:pk>/update-status/', DriverPickupStatusUpdateView.as_view()),
    path('<int:pk>/assign-driver/', PickupAssignDriverView.as_view()),
]