from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import selectinload, load_only
from .db import get_session
from .models import Post, PostProcess, Media,MediaType, Group, Page, PostProcessGroupLink, PostProcessPageLink, MediaType, PostTarget, Status
from typing import List, Optional
from sqlmodel import Session, select, delete, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime,timedelta
import random
from enum import Enum
from .lib.ai import ai
from .tasks import process_post, publish_post
from .ws import manager, Action

router = APIRouter(prefix="/posts", tags=["Posts"])

# Pydantic models for Media, Group, Page, PostProcess, etc.
class MediaRead(BaseModel):
    id: int
    url: str
    type_of: MediaType

    class Config:
        orm_mode = True

# Pydantic models for Media, Group, Page, PostProcess, etc.
class MediaRead(BaseModel):
    id: int
    url: str
    type_of: MediaType

    class Config:
        orm_mode = True

class GroupRead(BaseModel):
    id: int
    name: str
    fbid : str
    # Add other fields you want

    class Config:
        orm_mode = True

class PageRead(BaseModel):
    id: int
    name: str
    fbid: str
    # Add other fields you want

    class Config:
        orm_mode = True

class PostProcessReadMinimal(BaseModel):
    name: str
    use_ai : bool
    ai_model : str | None

    class Config:
        orm_mode = True

class PostRead(BaseModel):
    id: int
    scheduled_for: Optional[datetime]
    target: PostTarget
    target_id: str
    fb_id: Optional[str]
    message: Optional[str]
    text : str
    access_token: str
    status: Status
    published_at: Optional[datetime]
    created_at: datetime
    group: Optional[GroupRead] = None
    page: Optional[PageRead] = None
    process: Optional[PostProcessReadMinimal] = None  # Add this line

    class Config:
        orm_mode = True

class PostProcessRead(BaseModel):
    id: int
    text: Optional[str]
    scheduled_for: Optional[datetime]
    name: str
    interval: Optional[int]
    interval_range_start: Optional[int]
    interval_range_end: Optional[int]
    use_ai: bool
    ai_model : str | None
    status: Status
    medias: List[MediaRead] = []
    groups: List[GroupRead] = []
    pages: List[PageRead] = []

    class Config:
        orm_mode = True

class PostProcessCreate(BaseModel):
    text: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    name: str
    interval: Optional[int] = None
    interval_range_start: Optional[int] = None
    interval_range_end: Optional[int] = None
    use_ai: bool = False
    ai_model : str | None = "gpt-4o-mini"
    status: Optional[Status] = Status.pending
    medias: Optional[List[int]] = []
    groups: Optional[List[int]] = []
    pages: Optional[List[int]] = []
    
@router.get("/process/count")
async def get_all_processes_count(session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(func.count(PostProcess.id)))
    count = result.scalar()
    
    return {"count":count}

@router.delete("/delete-all-posts")
async def delete_all_posts(session: AsyncSession = Depends(get_session)):
    await session.execute(delete(Post))
    await session.commit()
    return {"message": "All posts deleted successfully"}

@router.get("/", response_model=List[PostRead])
async def list_posts(
    session: AsyncSession = Depends(get_session),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    offset = (page - 1) * limit

    stmt = (
        select(Post)
        .order_by(desc(Post.created_at))
        .options(selectinload(Post.process))
        .offset(offset)
        .limit(limit)
    )

    if search:
        stmt = stmt.join(Post.process).where(
            or_(
                Post.text.ilike(f"%{search}%"),
                PostProcess.name.ilike(f"%{search}%"),
                PostProcess.text.ilike(f"%{search}%")
            )
        )

    result = await session.execute(stmt)
    posts = result.scalars().all()

    modified_posts = []
    for post in posts:
        post_dict = dict(post)
        if post.target == PostTarget.group:
            group = await session.get(Group, post.target_id)
            post_dict['group'] = group
        elif post.target == PostTarget.page:
            page_obj = await session.get(Page, post.target_id)
            post_dict['page'] = page_obj
        modified_posts.append(post_dict)

    return modified_posts

@router.get("/count")
async def get_all_processes_count(session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(func.count(Post.id)))
    count = result.scalar()
    
    return {"count":count}

@router.get("/process", response_model=List[PostProcessRead])
async def list_post_processes(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(10, ge=1, description="Number of items per page (must be greater than 0)"),
    session: AsyncSession = Depends(get_session)):
    offset = (page - 1) * limit
    
    result = await session.execute(
        select(PostProcess)
        .order_by(desc(PostProcess.created_at))
        .options(
            selectinload(PostProcess.medias),
            selectinload(PostProcess.groups),
            selectinload(PostProcess.pages),
        )
        .offset(offset)
        .limit(limit)
    )
    processes = result.scalars().all()
    
    return processes

# Route to create a new post process and link medias, groups, and pages
@router.post("/process", response_model=PostProcess)
async def create_post_process(data: PostProcessCreate, session: AsyncSession = Depends(get_session)):
    post_process = PostProcess(
        text=data.text,
        scheduled_for=data.scheduled_for,
        name=data.name,
        interval=data.interval,
        interval_range_start=data.interval_range_start,
        interval_range_end=data.interval_range_end,
        use_ai=data.use_ai,
        ai_model = data.ai_model,
        status= Status.running
    )

    session.add(post_process)
    await session.commit()
    await session.refresh(post_process)
    
    post_ids = []

    # Link existing medias to this post process
    if data.medias:
        result = await session.execute(select(Media).where(Media.id.in_(data.medias)))
        medias = result.scalars().all()
        for media in medias:
            media.process_id = post_process.id

    # Add groups to this post process
    for group_id in data.groups or []:
        link = PostProcessGroupLink(post_process_id=post_process.id, group_id=group_id)
        session.add(link)

    # Add pages to this post process
    for page_id in data.pages or []:
        link = PostProcessPageLink(post_process_id=post_process.id, page_id=page_id)
        session.add(link)

    await session.commit()
    await session.refresh(post_process)

    # Create posts for each group and page with interval logic
    previous_post_scheduled_for = post_process.scheduled_for
    
    result = await session.execute(
        select(PostProcess)
        .options(
            selectinload(PostProcess.groups).selectinload(Group.admin),
            selectinload(PostProcess.pages)
        )
        .where(PostProcess.id == post_process.id)
    )
    post_process = result.scalar_one()

    # Creating posts for each group
    for group_link in post_process.groups:
        group = await session.get(Group, group_link.id)
        text = post_process.text
        # if post_process.use_ai:
        #     response = await ai.post(
        #         "/chat/completions",
        #         json={
        #             "model": post_process.ai_model,
        #             "messages": [{"role": "user", "content": text}]
        #         }
        #     )
        #     text = response.json()['choices'][0]['message']['content']
        if group:
            post = Post(
                text=text,
                scheduled_for=previous_post_scheduled_for,
                target=PostTarget.group,  # PostTarget.group
                target_id=str(group.id),
                fb_id=group.fbid,
                access_token=group.admin.access_token if group.admin else None,
                process_id=post_process.id,
                status=Status.queued
            )
            session.add(post)
            await session.flush()
            
            await manager.broadcast({
                "action": Action.post_create,
                'data': post.model_dump()
            })

            post_ids.append({"id":post.id,"scheduled_for":post.scheduled_for})

            # Schedule next post based on interval
            if post_process.interval:
                previous_post_scheduled_for = previous_post_scheduled_for + timedelta(minutes=post_process.interval)
            elif post_process.interval_range_start and post_process.interval_range_end:
                random_interval = random.randint(post_process.interval_range_start, post_process.interval_range_end)
                previous_post_scheduled_for = previous_post_scheduled_for + timedelta(minutes=random_interval)

    # Creating posts for each page
    for page_link in post_process.pages:
        page = await session.get(Page, page_link.id)
        if page:
            text = post_process.text
            # if post_process.use_ai:
            #     response = await ai.post(
            #         "/chat/completions",
            #         json={
            #             "model": post_process.ai_model,
            #             "messages": [{"role": "user", "content": text}]
            #         }
            #     )
            #     text = response.json()['choices'][0]['message']['content']
            post = Post(
                text=text,
                scheduled_for=previous_post_scheduled_for,
                target=PostTarget.page,  # PostTarget.page
                target_id=str(page.id),
                fb_id=page.fbid,
                access_token=page.access_token,
                process_id=post_process.id,
                status=Status.queued
            )
            session.add(post)
            await session.flush()
            
            await manager.broadcast({
                "action": Action.post_create,
                'data': post.model_dump()
            })

            post_ids.append({"id":post.id,"scheduled_for":post.scheduled_for})

            # Schedule next post based on interval
            if post_process.interval:
                previous_post_scheduled_for = previous_post_scheduled_for + timedelta(minutes=post_process.interval)
            elif post_process.interval_range_start and post_process.interval_range_end:
                random_interval = random.randint(post_process.interval_range_start, post_process.interval_range_end)
                previous_post_scheduled_for = previous_post_scheduled_for + timedelta(minutes=random_interval)

    # Commit the posts to the database
    await session.commit()
    await session.refresh(post_process)
    
    for post_id in post_ids:
        process_post.delay(post_id['id'])
        publish_post.apply_async(args=[post_id['id']], eta=post_id['scheduled_for'])
        
        
    await manager.broadcast({
        "action": Action.postprocess_create,
        'data': post_process.model_dump()
    })

    return post_process
    
@router.get("/{post_id}", response_model=PostRead)
async def get_post(post_id: int, details: bool = False,session : AsyncSession = Depends(get_session)):
    result = None
    post = None
    if details:
        result = await session.execute(
            select(Post)
            .where(Post.id == post_id)
            .options(
                selectinload(Post.process)  # Eager load process
            )
        ) 
        post = result.scalar_one_or_none()
        if post:
            post = dict(post)
            if post['target'] == PostTarget.group:
                group = await session.get(Group, post['target_id'])
                post['group'] = group
            elif post['target'] == PostTarget.page:
                page_obj = await session.get(Page, post['target_id'])
                post['page'] = page_obj
            return post
        else:
            raise HTTPException(status_code=404, detail="Post not found")
    else:
        result = await session.get(Post, post_id)
        if result:
            post = dict(result)
            post['process'] = None
            post['group'] = None
            post['page'] = None
            return post
        else:
            raise HTTPException(status_code=404, detail="Post not found")
