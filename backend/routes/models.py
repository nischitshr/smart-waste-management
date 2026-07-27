from django.contrib.gis.db import models
from users.models import User
from bins.models import WasteBin

class Vehicle(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('on_route', 'On Route'),
        ('maintenance', 'Maintenance'),
    ]

    driver = models.OneToOneField(User, on_delete=models.SET_NULL, null=True)
    plate_number = models.CharField(max_length=20, unique=True)
    capacity_tons = models.FloatField(default=5.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    def __str__(self):
        return f"{self.plate_number} - {self.driver}"

class CollectionRoute(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True)
    bins = models.ManyToManyField(WasteBin, blank=True)
    date = models.DateField()
    is_optimized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Route {self.id} - {self.date} ({self.vehicle})"

class GPSTrack(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    location = models.PointField(srid=4326)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']
        
class DriverShift(models.Model):
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shifts')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_in_location = models.PointField(srid=4326, null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    check_out_location = models.PointField(srid=4326, null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ['-check_in_time']

    def __str__(self):
        state = 'active' if self.is_active else 'ended'
        return f"Shift {self.id} - {self.driver.username} ({state})"