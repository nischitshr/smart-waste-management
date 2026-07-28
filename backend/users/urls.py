from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, WardListView
from .views import RegisterView, ProfileView, WardListView, DriverListView
from .views import RegisterView, ProfileView, WardListView, DriverListView, ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('wards/', WardListView.as_view()),
    path('drivers/', DriverListView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
]