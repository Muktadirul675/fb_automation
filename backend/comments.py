from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from .models import CommentProcess, Comment, User, CommentProcessUserLink, Status
from .db import get_session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/comments", tags=["Comments"])

class CommentProcessCreate(BaseModel):
    name: str
    text: str
    post_id: str
    scheduled_for: Optional[datetime] = None
    interval: Optional[int] = None
    interval_range_start: Optional[int] = None
    interval_range_end: Optional[int] = None
    use_ai: Optional[bool] = False
    user_ids: List[int] = []

class UserRead(BaseModel):
    id: int
    name: str
    picture: Optional[str] = None

    class Config:
        orm_mode = True

class CommentProcessRead(BaseModel):
    id: int
    name: str
    text: str
    post_id: str
    scheduled_for: Optional[datetime]
    interval: Optional[int]
    interval_range_start: Optional[int]
    interval_range_end: Optional[int]
    use_ai: bool
    status: Status
    created_at: datetime
    users: List[UserRead] = []

    class Config:
        orm_mode = True

class CommentRead(BaseModel):
    id: int
    text: str
    post_id: str
    status: str
    created_at: datetime
    user_id: Optional[int]
    user: UserRead
    scheduled_for: Optional[datetime]

    class Config:
        orm_mode = True

@router.post("/process", response_model=CommentProcessRead)
async def create_comment_process(data: CommentProcessCreate, session: AsyncSession = Depends(get_session)):
    comment_process = CommentProcess(
        name=data.name,
        text=data.text,
        post_id=data.post_id,
        scheduled_for=data.scheduled_for,
        interval=data.interval,
        interval_range_start=data.interval_range_start,
        interval_range_end=data.interval_range_end,
        use_ai=data.use_ai,
        status=Status.pending
    )
    session.add(comment_process)
    await session.flush()

    # Fetch users
    statement = select(User).where(User.id.in_(data.user_ids))
    users = (await session.execute(statement)).scalars().all()

    # Set base time
    current_time = data.scheduled_for or datetime.utcnow()
    
    # print(f"========\nInterval:{data.interval}\n=========\n")
    
    # return comment_process

    for user in users:
        # Link user to process
        link = CommentProcessUserLink(comment_process_id=comment_process.id, user_id=user.id)
        session.add(link)
        
        # print(current_time)

        comment = Comment(
            text=data.text,
            use_ai=data.use_ai,
            post_id=data.post_id,
            process_id=comment_process.id,
            user_id=user.id,
            scheduled_for=current_time,
            created_at=datetime.utcnow()
        )
        session.add(comment)

        # Update current_time for next comment
        if data.interval:
            # print(f"Interval: {data.interval}")
            current_time = current_time+ timedelta(minutes=data.interval)
        elif data.interval_range_start and data.interval_range_end:
            random_minutes = random.randint(data.interval_range_start, data.interval_range_end)
            current_time = current_time+ timedelta(minutes=random_minutes)

    await session.commit()
    await session.refresh(comment_process)
    return comment_process

@router.get("/process/count")
async def get_all_processes_count(session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(func.count(CommentProcess.id)))
    count = result.scalar()
    
    return {"count":count}

@router.get("/process", response_model=List[CommentProcessRead])
async def list_comment_processes(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(10, ge=1, description="Items per page (must be > 0)"),
    session: AsyncSession = Depends(get_session)
):
    offset = (page - 1) * limit
    result = await session.execute(
        select(CommentProcess)
        .options(selectinload(CommentProcess.users))
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/", response_model=List[CommentRead])
async def list_comments(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(10, ge=1, description="Items per page (must be > 0)"),
    session: AsyncSession = Depends(get_session)
):
    offset = (page - 1) * limit
    
    result = await session.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/count")
async def get_all_processes_count(session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(func.count(Comment.id)))
    count = result.scalar()
    
    return {"count":count}