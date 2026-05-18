#!/bin/bash
cd /app/fake-news-main/backend
python manage.py migrate --run-syncdb
exec gunicorn checkdem_backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 60
