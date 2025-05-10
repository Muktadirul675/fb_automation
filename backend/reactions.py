from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from typing import List, Optional
from .models import ReactionProcess, Reaction, User, Status, ReactionType, ReactionProcessUserLink
from .db import get_session
from pydantic import BaseModel
import random

router = APIRouter(prefix="/reactions", tags=["Reactions"])

# Pydantic model for creating a reaction process
class ReactionProcessCreate(BaseModel):
    name: str
    post_id: str
    scheduled_for: Optional[datetime] = None
    interval: Optional[int] = None
    interval_range_start: Optional[int] = None
    interval_range_end: Optional[int] = None
    type_of: ReactionType = ReactionType.like  # Accept type_of when creating
    user_ids: List[int] = []

# Pydantic model for reading reaction process data
class UserRead(BaseModel):
    id: int
    name: str
    picture: Optional[str]
    
    class Config:
        orm_mode = True

class ReactionProcessRead(BaseModel):
    id: int
    name: str
    post_id: str
    type_of: str
    status: Status
    scheduled_for: Optional[datetime]
    interval: Optional[int]
    interval_range_start: Optional[int]
    interval_range_end: Optional[int]
    use_ai: Optional[bool] = False
    created_at: datetime
    users: List[UserRead] = []

    class Config:
        orm_mode = True

# Pydantic model for reading reactions
class ReactionRead(BaseModel):
    id: int
    type_of: ReactionType
    post_id: str
    status: str
    created_at: datetime
    user: UserRead
    scheduled_for: Optional[datetime]

    class Config:
        orm_mode = True

# Create a reaction process
@router.post("/process", response_model=ReactionProcessRead)
async def create_reaction_process(data: ReactionProcessCreate, session: AsyncSession = Depends(get_session)):
    # Create the reaction process with type_of included
    reaction_process = ReactionProcess(
        name=data.name,
        post_id=data.post_id,
        scheduled_for=data.scheduled_for,
        interval=data.interval,
        interval_range_start=data.interval_range_start,
        interval_range_end=data.interval_range_end,
        status=Status.pending,
        type_of=data.type_of
    )
    session.add(reaction_process)
    await session.flush()

    # Fetch users based on user_ids
    statement = select(User).where(User.id.in_(data.user_ids))
    users = (await session.execute(statement)).scalars().all()

    # Set base time for scheduling reactions
    current_time = data.scheduled_for or datetime.utcnow()

    # Create reactions for each user linked to the process
    for user in users:
        # Link user to process
        link = ReactionProcessUserLink(reaction_process_id=reaction_process.id, user_id=user.id)
        session.add(link)

        reaction = Reaction(
            type_of=data.type_of,
            post_id=data.post_id,
            user_id=user.id,
            process_id=reaction_process.id,
            scheduled_for=current_time,
            created_at=datetime.utcnow()
        )
        session.add(reaction)

        # Update current_time for the next reaction
        if data.interval:
            current_time = current_time + timedelta(minutes=data.interval)
        elif data.interval_range_start and data.interval_range_end:
            random_minutes = random.randint(data.interval_range_start, data.interval_range_end)
            current_time = current_time + timedelta(minutes=random_minutes)

    await session.commit()
    await session.refresh(reaction_process)
    return reaction_process

@router.get("/process", response_model=List[ReactionProcessRead])
async def list_reaction_processes(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(10, ge=1, description="Items per page (must be > 0)"),
    session: AsyncSession = Depends(get_session)
):
    offset = (page - 1) * limit
    result = await session.execute(
        select(ReactionProcess)
        .offset(offset)
        .options(selectinload(ReactionProcess.users))
        .limit(limit)
    )
    return result.scalars().all()

# List all reactions
@router.get("/", response_model=List[ReactionRead])
async def list_reactions(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(10, ge=1, description="Items per page (must be > 0)"),
    session: AsyncSession = Depends(get_session)
):
    offset = (page - 1) * limit
    result = await session.execute(
        select(Reaction)
        .options(selectinload(Reaction.user))
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/process/count")
async def get_all_processes_count(session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(func.count(ReactionProcess.id)))
    count = result.scalar()
    
    return {"count":count}

@router.get("/count")
async def get_all_processes_count(session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(func.count(Reaction.id)))
    count = result.scalar()
    
    return {"count":count}