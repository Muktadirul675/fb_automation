from .tasks import celery_app

# Run this with:
# celery -A celery_worker.celery_app worker --loglevel=info