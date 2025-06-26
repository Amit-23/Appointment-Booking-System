# appointmentHub_backend/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import CookieMiddleware
import chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appointmentHub_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": CookieMiddleware(  # First wrap with CookieMiddleware
        AuthMiddlewareStack(  # Then Auth
            URLRouter(  # Then URL routing
                chat.routing.websocket_urlpatterns
            )
        )
    ),
})