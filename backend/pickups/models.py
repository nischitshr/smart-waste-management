from django.db import models
from users.models import User, Ward
from bins.models import WasteBin  # adjust if your bins app/model is named differently


class PickupRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='pickup_requests')
    assigned_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_pickups')
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True)
    bin = models.ForeignKey(WasteBin, on_delete=models.SET_NULL, null=True, blank=True, related_name='pickup_requests')
    address = models.CharField(max_length=255, blank=True)  # now optional — auto-filled from bin if selected
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pickup {self.id} - {self.scheduled_date} ({self.status})"