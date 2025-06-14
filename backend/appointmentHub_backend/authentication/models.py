from django.db import models
from django.contrib.auth.hashers import make_password

class UserAccount(models.Model):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
    )

    name = models.CharField(max_length=30)
    email = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # Freelancer-only fields (optional for clients)
    profession = models.CharField(max_length=50, blank=True, null=True)
    experience = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.role})"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'), # Appointment booked but not responded to
        ('accepted', 'Accepted'), # Freelancer has accepted it
        ('rejected', 'Rejected'), # Freelancer has rejected it
        ('cancelled', 'Cancelled'), # Client cancelled the appointment
        ('completed', 'Completed'), # Appointment has been completed
    ]

    # client: who booked the appointment
    client = models.ForeignKey(
        'UserAccount',
        on_delete=models.CASCADE,
        related_name='appointments_made'  # access with client.appointments_made.all()
    )

    # freelancer: who was booked
    freelancer = models.ForeignKey(
        'UserAccount',
        on_delete=models.CASCADE,
        related_name='appointments_received'  # access with freelancer.appointments_received.all()
    )

    # Date and time of the appointment
    date = models.DateField()
    

    # Status of the appointment
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Optional message or reason from client while booking
    message = models.TextField(blank=True, null=True)

    # Auto-set when the appointment was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} → {self.freelancer.name} on {self.date} ({self.status})"