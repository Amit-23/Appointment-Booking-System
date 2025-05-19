from django.db import models
from users.models import User

class AdminActionLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=100)
    description = models.TextField()
    target_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='targeted_by_admin')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin.email} - {self.action_type}"
