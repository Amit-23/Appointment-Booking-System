from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
def client_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            
            # Add your validation and user creation logic here
            # For example:
            # if not all([name, email, password]):
            #     return JsonResponse({'error': 'All fields are required'}, status=400)
            
            return JsonResponse({
                'success': True,
                'message': 'Client created successfully',
                'data': {
                    'name': name,
                    'email': email
                }
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)