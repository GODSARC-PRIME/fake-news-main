#!/bin/bash
set -e  # Exit immediately if any command fails

# Use absolute path — Railway extracts the repo to /app/
cd /app/fake-news-main/backend

echo "==> Running migrations..."
python manage.py migrate --run-syncdb

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn..."
exec gunicorn checkdem_backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120 \
  --log-level info
