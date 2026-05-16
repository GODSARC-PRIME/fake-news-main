#!/bin/bash
cd fake-news-main/backend
python manage.py migrate --run-syncdb
exec gunicorn checkdem_backend.wsgi
