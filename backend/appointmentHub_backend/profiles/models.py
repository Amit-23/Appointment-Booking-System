from django.db import models
from users.models import User

class ProfessionalProfile(models.Model):
    CATEGORY_CHOICES = [
        ('doctor', 'Doctor'),
        ('tutor', 'Tutor'),
        ('lawyer', 'Lawyer'),
        ('developer','Developer'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    bio = models.TextField()
    experience_years = models.IntegerField()
    average_rating = models.FloatField(default=0.0)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.full_name} ({self.category})"
