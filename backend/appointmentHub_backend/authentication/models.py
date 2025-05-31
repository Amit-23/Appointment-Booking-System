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
