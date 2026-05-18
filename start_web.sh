#!/bin/bash
cd fake-news-main/backend
export PYTHONPATH="/app/fake-news-main/backend:$PYTHONPATH"
python manage.py migrate --run-syncdb || exit 1
exec gunicorn checkdem_backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 60
