from django.urls import path
from . import views

urlpatterns = [
    path('usersignup/', views.user_signup, name='user-signup'),
   
]