from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Ward
from .serializers import UserSerializer, WardSerializer, RegisterSerializer
from .permissions import IsAdmin

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class WardListView(generics.ListAPIView):
    serializer_class = WardSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Ward.objects.all()

# Create your views here.
class DriverListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = User.objects.filter(role='driver')
    
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, WardSerializer, RegisterSerializer, ChangePasswordSerializer


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password updated successfully.'})