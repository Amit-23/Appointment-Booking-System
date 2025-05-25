from django.db import models
from django.contrib.auth.hashers import make_password


class createClient(models.Model):
    name = models.CharField(max_length=30)
    email = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # If the password is not already hashed, hash it
        if not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
