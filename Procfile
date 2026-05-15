web: cd fake-news-main/backend && gunicorn checkdem_backend.wsgi
worker: cd fake-news-main/backend && celery -A checkdem_backend worker -l info
beat: cd fake-news-main/backend && celery -A checkdem_backend beat -l info
