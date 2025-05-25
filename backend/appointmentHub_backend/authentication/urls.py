from django.urls import path
from . import views

urlpatterns = [
    path('clientsignup/', views.client_signup, name='client-signup'),
   
]