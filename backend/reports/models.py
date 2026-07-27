from django.contrib.gis.db import models
from users.models import User, Ward

class DumpingReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('resolved', 'Resolved'),
    ]

    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True)
    location = models.PointField(srid=4326)
    title = models.CharField(max_length=100, default='Untitled report')
    description = models.TextField()
    photo = models.ImageField(upload_to='reports/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Report {self.id} - {self.status} ({self.created_at.date()})"