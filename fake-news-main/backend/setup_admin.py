#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'checkdem_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Delete existing admin if present
User.objects.filter(username='admin').delete()
Token.objects.all().delete()

# Create new admin user
user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
token = Token.objects.create(user=user)
print(f"✅ Admin user created successfully")
print(f"Username: admin")
print(f"Password: admin123")
print(f"Token: {token.key[:20]}...")
