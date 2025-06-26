from django.db import models
from authentication.models import UserAccount, Appointment

class ChatMessage(models.Model):
    appointment = models.ForeignKey(
        Appointment, 
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        UserAccount, 
        on_delete=models.CASCADE
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.name}: {self.message[:20]}..."