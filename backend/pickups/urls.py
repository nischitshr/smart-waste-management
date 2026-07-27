from django.urls import path
from .views import (
    PickupRequestListCreateView,
    PickupRequestDetailView,
    DriverPickupStatusUpdateView,
    PickupAssignDriverView,
)

urlpatterns = [
    path('', PickupRequestListCreateView.as_view()),
    path('<int:pk>/', PickupRequestDetailView.as_view()),
    path('<int:pk>/update-status/', DriverPickupStatusUpdateView.as_view()),
    path('<int:pk>/assign-driver/', PickupAssignDriverView.as_view()),
]