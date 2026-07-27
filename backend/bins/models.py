from django.contrib.gis.db import models
from users.models import Ward

class WasteBin(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
    ]
    WASTE_TYPE_CHOICES = [
        ('general', 'General'),
        ('organic', 'Organic'),
        ('recyclable', 'Recyclable'),
    ]

    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True)
    location = models.PointField(srid=4326)
    address = models.CharField(max_length=255)
    waste_type = models.CharField(max_length=20, choices=WASTE_TYPE_CHOICES, default='general')
    fill_level = models.IntegerField(default=0)  # 0-100 percent
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_collected = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bin {self.id} - {self.address} ({self.fill_level}%)"

    @property
    def is_high_priority(self):
        return self.fill_level >= 80