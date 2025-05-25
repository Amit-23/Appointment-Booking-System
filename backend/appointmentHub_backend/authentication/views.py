from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import createClient
from django.contrib.auth.hashers import make_password

@csrf_exempt
def client_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '').strip()

            # Validation
            errors = {}
            if not name:
                errors['name'] = 'Name is required'
            if not email:
                errors['email'] = 'Email is required'
            elif not '@' in email:  # Basic email validation
                errors['email'] = 'Enter a valid email address'
            if not password:
                errors['password'] = 'Password is required'
            elif len(password) < 6:
                errors['password'] = 'Password must be at least 6 characters'
            
            if errors:
                return JsonResponse({
                    'success': False, 
                    'errors': errors
                }, status=400)

            if createClient.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'email': 'This email is already registered'
                    }
                }, status=409)

            # Create client with hashed password
            client = createClient(
                name=name,
                email=email,
                password=make_password(password)  # Hash the password
            )
            client.save()

            return JsonResponse({
                'success': True,
                'message': 'Account created successfully'
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid data format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': 'Server error'
            }, status=500)

    return JsonResponse({
        'success': False,
        'error': 'Method not allowed'
    }, status=405)