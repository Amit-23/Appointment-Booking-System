from django.db import models
from users.models import User
from profiles.models import ProfessionalProfile

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_appointments')
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client.full_name} → {self.professional.user.full_name} @ {self.start_time}"
