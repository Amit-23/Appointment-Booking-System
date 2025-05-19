from django.db import models
from profiles.models import ProfessionalProfile

class AvailabilitySlot(models.Model):
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=False)
    weekday = models.IntegerField(null=True, blank=True)  # 0 = Monday
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.professional.user.full_name} - {self.date} {self.start_time}-{self.end_time}"
