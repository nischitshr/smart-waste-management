from rest_framework import serializers
from .models import User, Ward

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = ['id', 'number', 'name']

class UserSerializer(serializers.ModelSerializer):
    ward = WardSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'ward']
        read_only_fields = ['id', 'username', 'role', 'ward']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']
        # 'role' intentionally excluded — public registration must never let
        # the client choose its own role. All self-registered accounts are
        # forced to 'citizen' below, regardless of what the request sends.

    def create(self, validated_data):
        validated_data['role'] = 'citizen'
        return User.objects.create_user(**validated_data)