from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import UserAccount, FreelancerAvailability
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
