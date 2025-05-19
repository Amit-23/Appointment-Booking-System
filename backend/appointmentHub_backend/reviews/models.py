from django.db import models
from appointments.models import Appointment

class Review(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    rating = models.IntegerField()  # You can add validation 1-5 in serializer
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.appointment}"
