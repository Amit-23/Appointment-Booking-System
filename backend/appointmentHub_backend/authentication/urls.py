from django.urls import path
from . import views

urlpatterns = [
    path('usersignup/', views.user_signup, name='user-signup'),
    path('login/', views.login, name='login'),
    path('getfreelencers/',views.getFreelencers,name='getfreelencers'),
    path('available-freelancers/',views.get_available_freelancers),
    path('addavailability/',views.add_availability),
    path('book-appointment/', views.book_appointment, name='book-appointment'),
    path('freelancer-appointments/', views.get_freelancer_appointments),
    path('client-appointments/',views.get_client_appointments),
    path('update-appointment-status/',views.update_appointment_status),
    path('freelancer-availabilities/', views.get_freelancer_availabilities, name='freelancer_availabilities'),
    path('update-profile/', views.update_profile, name='update_profile'),
   
]