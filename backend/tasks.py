import redis
import requests
from celery import Celery
from backend.db import get_session_sync, get_session_celery
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from enum import Enum
from backend.models import Post, Status, PostProcess

r = redis.Redis()

class Action(str, Enum):
    postprocess_create = "postprocess.create"
    post_create = "post.create"
    post_update = "post.update"

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

def get_ai_response(text: str, model: str):
    headers = {
        "Content-Type": "application/json",
        "accept": "application/json",
        "Ocp-Apim-Subscription-Key": "sk-SvASnX-rljk7nCKqjiwurg"
    }
    response = requests.post(
        "https://ai.worthmind.net/chat/completions",
        headers=headers,
        json={
            "model": model,
            "messages": [{"role": "user", "content": text}]
        }
    )
    response.raise_for_status()  # Optional: raises an error on bad response
    return response.json()['choices'][0]['message']['content']

@celery_app.task
def add(x, y):
    return x + y

@celery_app.task
def publish_post(post_id):
    print(f"\n===========\nSceduling {post_id}\n==========\n")
    with get_session_celery() as session:
        post = session.get(Post, post_id)
        if post:
            post.status = Status.published
            session.commit()
            print(f"\n===========\nScedule done {post_id}\n==========\n")
            r.publish(Action.post_update, post_id)

@celery_app.task
def process_post(post_id):
    print(f"\n==========\nProcessing Post {post_id}\n============\n")
    with get_session_celery() as session:
        post = (
            session.query(Post)
            .options(
                joinedload(Post.process).load_only(
                    PostProcess.id, PostProcess.text, PostProcess.use_ai, PostProcess.ai_model
                )
            )
            .filter(Post.id == post_id)
            .first()
        )
        
        if post and post.process:
            if post.process.use_ai:
                try:
                    text = get_ai_response(post.text, post.process.ai_model)

                    post.text = text
                    

                except Exception as e:
                    print(f"AI call or update failed: {e}")
                
            # post.status = Status.queued
            session.commit()

            
