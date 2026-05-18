web: sh start_web.sh
worker: cd /app/fake-news-main/backend && celery -A checkdem_backend worker -l info --concurrency 2
beat: cd /app/fake-news-main/backend && celery -A checkdem_backend beat -l info
