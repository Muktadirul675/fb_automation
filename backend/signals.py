from sqlalchemy import event
from sqlalchemy.orm import Session as OrmSession
from datetime import datetime, timedelta
import random
from .db import get_session_sync

from .models import PostProcess, Post, PostTarget, Page, Group  # adjust import path
# Make sure PostProcess.__tablename__ is properly set or SQLModel infers it

def calculate_next_schedule_time(process: PostProcess, current_time: datetime) -> datetime:
    if process.interval:
        return current_time + timedelta(minutes=process.interval)
    elif process.interval_range_start and process.interval_range_end:
        interval = random.randint(process.intervallistener_range_start, process.interval_range_end)
        return current_time + timedelta(minutes=interval)
    return current_time

@event.listens_for(PostProcess, "after_insert")
def create_posts_after_postprocess_insert(mapper, connection, target: PostProcess):
    print("===============================Signal Captured")
    
    with get_session_sync() as orm_session:
        scheduled_time = target.scheduled_for or datetime.utcnow()
        posts_to_create = []

        # Fetch related pages and groups manually since SQLAlchemy does not auto-load them
        orm_session.add(target)
        orm_session.refresh(target)

        target_pages = orm_session.query(Page).join(Page.post_processes).filter(PostProcess.id == target.id).all()
        target_groups = orm_session.query(Group).join(Group.post_processes).filter(PostProcess.id == target.id).all()

        for group in target_groups:
            access_token = group.admin.access_token if group.admin else ""
            post = Post(
                scheduled_for=scheduled_time,
                target=PostTarget.group,
                target_id=group.fbid,
                message=target.text,
                access_token=access_token,
                process_id=target.id,
                created_at=datetime.utcnow()
            )
            posts_to_create.append(post)
            scheduled_time = calculate_next_schedule_time(target, scheduled_time)

        for page in target_pages:
            post = Post(
                scheduled_for=scheduled_time,
                target=PostTarget.page,
                target_id=page.fbid,
                message=target.text,
                access_token=page.access_token,
                process_id=target.id,
                created_at=datetime.utcnow()
            )
            posts_to_create.append(post)
            scheduled_time = calculate_next_schedule_time(target, scheduled_time)

        # Save posts
        orm_session.add_all(posts_to_create)
        orm_session.flush()

        # Link medias
        for post in posts_to_create:
            post.medias = target.medias  # same media list for all
        orm_session.commit()
