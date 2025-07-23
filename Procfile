web: gunicorn 'main:app'
worker: celery -A main.celery_app worker --loglevel=info