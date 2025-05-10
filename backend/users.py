from fastapi import APIRouter, Depends
from .models import User, Reaction, Comment
from typing import List, Optional
from .db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from sqlmodel import Session, select, delete, update, func
from sqlalchemy.orm import selectinload
from datetime import datetime

router = APIRouter(prefix="/users", tags=['Users'])

class UserCreate(BaseModel):
    name: str
    picture: Optional[str] = None
    fb_id: str
    email: str
    access_token: str
    is_admin: bool = False

# Pydantic models for nested relationships

class GroupRead(BaseModel):
    id: int
    name: str
    fbid: str
    admin_id: int | None
    admin_name: str  # You can extract the name of the admin user

    class Config:
        orm_mode = True


class PageRead(BaseModel):
    id: int
    name: str
    fbid: str
    access_token: str
    admin_id: int | None
    admin_name: str  # You can extract the name of the admin user

    class Config:
        orm_mode = True


class UserRead(BaseModel):
    id: int
    name: str
    picture: str | None
    fb_id: str
    email: str
    access_token: str
    expiry: datetime
    is_admin: bool
    group_count: int
    page_count: int
    total_reactions: int
    total_comments: int

    groups: List[GroupRead] = []
    pages: List[PageRead] = []

    class Config:
        orm_mode = True

@router.get("/", response_model=List[UserRead])
async def get_users_with_counts(db: AsyncSession = Depends(get_session)) -> List[UserRead]:
    # Query to fetch users with related groups and pages
    query = select(User).options(
        selectinload(User.groups),
        selectinload(User.pages),
    )

    # Execute the query asynchronously
    result = await db.execute(query)
    users = result.scalars().all()

    # Prepare the response with counts of reactions and comments
    user_read_list = []
    for user in users:
        # Count reactions and comments for each user using async queries
        reaction_count = await db.execute(
            select(func.count(Reaction.id)).filter(Reaction.user_id == user.id)
        )
        reaction_count = reaction_count.scalar()

        comment_count = await db.execute(
            select(func.count(Comment.id)).filter(Comment.user_id == user.id)
        )
        comment_count = comment_count.scalar()

        user_read = UserRead(
            id=user.id,
            name=user.name,
            picture=user.picture,
            fb_id=user.fb_id,
            email=user.email,
            access_token=user.access_token,
            expiry=user.expiry,
            is_admin=user.is_admin,
            group_count=len(user.groups),
            page_count=len(user.pages),
            total_reactions=reaction_count,
            total_comments=comment_count,
            groups=[GroupRead(id=group.id, name=group.name, fbid=group.fbid, admin_id=group.admin_id, admin_name=group.admin.name) for group in user.groups],
            pages=[PageRead(id=page.id, name=page.name, fbid=page.fbid, access_token=page.access_token, admin_id=page.admin_id, admin_name=page.admin.name) for page in user.pages],
        )
        user_read_list.append(user_read)

    return user_read_list

@router.post("/", response_model=User)
async def create_user(user: UserCreate, session: AsyncSession = Depends(get_session)):
    # Check if email already exists
    # existing_user = (await session.execute(select(User).where(User.email == user.email))).first()
    # if existing_user:
    #     raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=user.name,
        fb_id=user.fb_id,
        email=user.email,
        access_token=user.access_token,
        picture= user.picture,
        is_admin=user.is_admin
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

@router.delete("/admins")
async def remove_an_user_from_admins(user_id:int, session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update is_admin to True
    stmt = update(User).where(User.id == user_id).values(is_admin=False)
    await session.execute(stmt)
    await session.commit()

    # Optional: return updated user
    await session.refresh(user)
    return {"message": f"User {user_id} has been removed from admins", "user": user}

@router.post("/admins")
async def make_an_user_admin(user_id:int, session : AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update is_admin to True
    stmt = update(User).where(User.id == user_id).values(is_admin=True)
    await session.execute(stmt)
    await session.commit()

    # Optional: return updated user
    await session.refresh(user)
    return {"message": f"User {user_id} is now an admin", "user": user}

