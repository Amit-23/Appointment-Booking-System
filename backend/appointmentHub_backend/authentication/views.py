from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import UserAccount  # Correct import
from django.contrib.auth.hashers import make_password

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
def login(request):
    return JsonResponse({
        'success':'Login success'
    })