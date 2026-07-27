from django.contrib.auth.models import AbstractUser
from django.db import models

class Ward(models.Model):
    number = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"Ward {self.number} - {self.name}"

class User(AbstractUser):
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    phone = models.CharField(max_length=15, blank=True)
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"