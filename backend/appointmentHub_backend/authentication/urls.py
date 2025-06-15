from django.urls import path
from . import views

urlpatterns = [
    path('usersignup/', views.user_signup, name='user-signup'),
    path('login/', views.login, name='login'),
    path('getfreelencers/',views.getFreelencers,name='getfreelencers'),
    path('available-freelancers/',views.get_available_freelancers),
    path('addavailability/',views.add_availability),
   
]