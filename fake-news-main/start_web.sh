#!/bin/bash

cd /app/fake-news-main/backend

python manage.py migrate --run-syncdb

python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.getenv('ADMIN_USERNAME', '')
email = os.getenv('ADMIN_EMAIL', '')
password = os.getenv('ADMIN_PASSWORD', '')
if username and password:
    user, created = User.objects.get_or_create(username=username)
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    print('Admin user ready: ' + username)
else:
    print('ADMIN env vars not set - skipping')
EOF

python manage.py collectstatic --noinput

exec gunicorn checkdem_backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120 \
  --log-level info