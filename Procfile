web: sh start_web.sh
worker: cd backend && celery -A checkdem_backend worker -l info
beat: cd backend && celery -A checkdem_backend beat -l info
