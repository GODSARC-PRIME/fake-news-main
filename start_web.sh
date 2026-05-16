#!/bin/bash
cd backend
python manage.py migrate --run-syncdb
exec gunicorn checkdem_backend.wsgi
