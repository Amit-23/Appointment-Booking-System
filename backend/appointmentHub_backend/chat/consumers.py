# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatMessage
from authentication.models import Appointment

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("\n=== NEW WEBSOCKET CONNECTION ===")
        print(f"User: {self.scope['user']}")
        print(f"Path: {self.scope['path']}")
        print(f"Headers: {self.scope['headers']}")
        await self.accept()
        print("=== CONNECTION ACCEPTED ===\n")
        self.appointment_id = self.scope['url_route']['kwargs']['appointment_id']
        self.room_group_name = f'chat_{self.appointment_id}'
        self.user = self.scope['user']

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        if await self.is_authorized():
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if not await self.is_authorized():
            return

        # Save message to database
        await self.save_message(message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.name,
                'timestamp': str(datetime.now()),
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def is_authorized(self):
        """Check if user is either client or freelancer for this appointment"""
        if isinstance(self.user, AnonymousUser):
            return False
            
        try:
            appointment = Appointment.objects.get(id=self.appointment_id)
            return (self.user == appointment.client or 
                    self.user == appointment.freelancer)
        except Appointment.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, message):
        appointment = Appointment.objects.get(id=self.appointment_id)
        ChatMessage.objects.create(
            appointment=appointment,
            sender=self.user,
            message=message
        )