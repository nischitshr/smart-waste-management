from django.urls import path
from .views import (
    WasteBinListView,
    WasteBinDetailView,
    WasteBinAdminListCreateView,
    WasteBinAdminDetailView,
    WasteBinDriverListView,
)

urlpatterns = [
    path('admin/', WasteBinAdminListCreateView.as_view()),
    path('admin/<int:pk>/', WasteBinAdminDetailView.as_view()),
    path('', WasteBinListView.as_view()),
    path('<int:pk>/', WasteBinDetailView.as_view()),
    path('driver/', WasteBinDriverListView.as_view()),
]