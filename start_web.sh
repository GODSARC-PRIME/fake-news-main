#!/bin/bash
set -e  # Exit immediately if any command fails

# Use absolute path — Railway extracts the repo to /app/
cd /app/fake-news-main/backend

echo "==> Running migrations..."
python manage.py migrate --run-syncdb

echo "==> Creating admin user if not exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.getenv('ADMIN_USERNAME', '')
email = os.getenv('ADMIN_EMAIL', '')
password = os.getenv('ADMIN_PASSWORD', '')
if username and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print('Admin user created: ' + username)
else:
    print('Admin user already exists or env vars not set')
"

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn..."
exec gunicorn checkdem_backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120 \
  --log-level info
