from django.http import JsonResponse
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
import json
from .models import UserAccount, FreelancerAvailability, Appointment
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from django.views.decorators.http import require_GET
from django.views.decorators.http import require_http_methods  
@csrf_exempt
def user_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '').strip()
            role = data.get('role', '').strip().lower()

            # Optional fields (for freelancer)
            profession = data.get('profession')
            experience = data.get('experience')
            bio = data.get('bio')

            # Basic validation
            errors = {}
            if role not in ['client', 'freelancer']:
                errors['role'] = 'Role must be client or freelancer'
            if not name:
                errors['name'] = 'Name is required'
            if not email or '@' not in email:
                errors['email'] = 'Valid email is required'
            if not password or len(password) < 6:
                errors['password'] = 'Password must be at least 6 characters'

            if UserAccount.objects.filter(email=email).exists():
                errors['email'] = 'Email already registered'

            if errors:
                return JsonResponse({
                    'success': False,
                    'errors': errors,
                    'message': 'Validation failed'
                }, status=400)

            # Save the user
            user = UserAccount(
                name=name,
                email=email,
                password=make_password(password),
                role=role,
                profession=profession if role == 'freelancer' else None,
                experience=experience if role == 'freelancer' else None,
                bio=bio if role == 'freelancer' else None
            )
            user.save()

            return JsonResponse({
                'success': True,
                'message': 'Account created successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON',
                'message': 'Invalid request data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e),
                'message': 'Internal server error'
            }, status=500)

    return JsonResponse({
        'success': False,
        'error': 'Method not allowed',
        'message': 'Only POST requests are allowed'
    }, status=405)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()

        # Basic validation
        errors = {}
        if not email or '@' not in email:
            errors['email'] = 'Valid email is required'
        if not password:
            errors['password'] = 'Password is required'

        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors,
                'message': 'Validation failed'
            }, status=400)

        # Check if user exists
        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }, status=401)

        # Verify password
        if not check_password(password, user.password):
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }, status=401)

        # Successful login
        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'profession': user.profession if user.role == 'freelancer' else None
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON',
            'message': 'Invalid request data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': 'Internal server error'
        }, status=500)

@require_GET
@csrf_exempt
def getFreelencers(request):
    try:
        freelancers = UserAccount.objects.filter(
            role='freelancer'
        ).exclude(profession__isnull=True).exclude(profession__exact='')

        professions = freelancers.values_list('profession', flat=True).distinct()

        return JsonResponse({
            'success': True,
            'professions': list(professions)
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': 'Internal server error'
        }, status=500)



@require_GET
@csrf_exempt
def get_available_freelancers(request):
    date = request.GET.get('date')
    category = request.GET.get('category')

    if not date:
        return JsonResponse({'success': False, 'message': 'Date is required'}, status=400)

    availability = FreelancerAvailability.objects.filter(date=date)

    if category:
        availability = availability.filter(freelancer__profession__iexact=category)

    freelancers = [
        {
            'id': slot.freelancer.id,
            'name': slot.freelancer.name,
            'email': slot.freelancer.email,
            'profession': slot.freelancer.profession,
            'start_time': slot.start_time.strftime('%H:%M'),
            'end_time': slot.end_time.strftime('%H:%M'),
           
        }
        for slot in availability
    ]

    return JsonResponse({'success': True, 'freelancers': freelancers})


@csrf_exempt
@require_http_methods(["POST"])
def add_availability(request):
    try:
        data = json.loads(request.body)

        freelancer_id = data.get('freelancer_id')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        freelancer = UserAccount.objects.get(id=freelancer_id, role='freelancer')

        FreelancerAvailability.objects.create(
            freelancer=freelancer,
            date=date,
            start_time=start_time,
            end_time=end_time
        )

        return JsonResponse({'success': True, 'message': 'Availability added'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
  


@csrf_exempt
@require_http_methods(["POST"])
def book_appointment(request):
    try:
        
        data = json.loads(request.body)
        print(data)
        client_id = data.get('client_id')
        freelancer_id = data.get('freelancer_id')
        date = data.get('date')  # string: '2025-06-15'
        start_time = data.get('start_time')  # string: '14:32'

        client = UserAccount.objects.get(id=client_id, role='client')
        freelancer = UserAccount.objects.get(id=freelancer_id, role='freelancer')

        # Convert strings to proper Python date/time
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
        appointment_time = datetime.strptime(start_time, "%H:%M").time()

        Appointment.objects.create(
            client=client,
            freelancer=freelancer,
            date=appointment_date,
            start_time=appointment_time,
            status='pending'
        )

        return JsonResponse({'success': True, 'message': 'Appointment booked successfully'})

    except Exception as e:
        print("❌ Error:", str(e))
        return JsonResponse({'success': False, 'error': str(e)}, status=500)



@csrf_exempt
@require_GET
def get_freelancer_appointments(request):
    try:
        freelancer_id = request.GET.get('freelancer_id')

        if not freelancer_id:
            return JsonResponse({'success': False, 'error': 'freelancer_id required'}, status=400)

        freelancer = UserAccount.objects.get(id=freelancer_id, role='freelancer')

        appointments = Appointment.objects.filter(freelancer=freelancer).order_by('-date')

        data = []
        for appt in appointments:
            data.append({
                'client_name': appt.client.name,
                'date': appt.date.strftime('%Y-%m-%d'),
                'start_time': appt.start_time.strftime('%H:%M'),
                'status': appt.status,
                'appointment_id': appt.id
            })

        return JsonResponse({'success': True, 'appointments': data})

    except UserAccount.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Freelancer not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_GET
def get_client_appointments(request):
    client_id = request.GET.get('client_id')
    if not client_id:
        return JsonResponse({'success': False, 'error': 'client_id required'}, status=400)

    try:
        client = UserAccount.objects.get(id=client_id, role='client')
    except UserAccount.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Client not found'}, status=404)

    appts = Appointment.objects.filter(client=client).order_by('-date')
    data = []
    for appt in appts:
        data.append({
            'appointment_id': appt.id,
            'freelancer_name': appt.freelancer.name,
            'date': appt.date.strftime('%Y-%m-%d'),
            'start_time': appt.start_time.strftime('%H:%M'),
            'status': appt.status
        })
    return JsonResponse({'success': True, 'appointments': data})


@csrf_exempt
@require_http_methods(["POST"])
def update_appointment_status(request):
    """
    Expects JSON: { appointment_id: int, status: 'accepted'|'rejected' }
    """
    try:
        data = json.loads(request.body)
        appt_id   = data.get('appointment_id')
        new_status = data.get('status')
        if new_status not in ('accepted', 'rejected'):
            return JsonResponse({'success': False, 'error': 'Invalid status'}, status=400)

        appt = Appointment.objects.get(id=appt_id)
        appt.status = new_status
        appt.save()

        return JsonResponse({'success': True, 'appointment_id': appt.id, 'new_status': new_status})
    except Appointment.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@require_GET
def get_freelancer_availabilities(request):
    try:
        freelancer_id = request.GET.get('freelancer_id')
        
        if not freelancer_id:
            return JsonResponse({'success': False, 'error': 'freelancer_id required'}, status=400)

        # Verify the user exists and is a freelancer
        freelancer = UserAccount.objects.get(id=freelancer_id, role='freelancer')
        
        # Get all availabilities for this freelancer
        availabilities = FreelancerAvailability.objects.filter(
            freelancer=freelancer
        ).order_by('date', 'start_time')

        # Prepare the response data
        data = []
        for avail in availabilities:
            data.append({
                'id': avail.id,
                'date': avail.date.strftime('%Y-%m-%d'),
                'start_time': avail.start_time.strftime('%H:%M'),
                'end_time': avail.end_time.strftime('%H:%M'),
                'status': 'booked' if Appointment.objects.filter(
                    freelancer=freelancer,
                    date=avail.date,
                    start_time=avail.start_time
                ).exists() else 'available'
            })

        return JsonResponse({
            'success': True,
            'availabilities': data
        })

    except UserAccount.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Freelancer not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)