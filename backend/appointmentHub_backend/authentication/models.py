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
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    client = models.ForeignKey(
        'UserAccount',
        on_delete=models.CASCADE,
        related_name='appointments_made'
    )
    freelancer = models.ForeignKey(
        'UserAccount',
        on_delete=models.CASCADE,
        related_name='appointments_received'
    )

    date = models.DateField()
    start_time = models.TimeField() 

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} → {self.freelancer.name} on {self.date} at {self.start_time} ({self.status})"

class FreelancerAvailability(models.Model):
    freelancer = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='availability')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    def __str__(self):
        return f"{self.freelancer.name} available on {self.date} from {self.start_time} to {self.end_time}"
