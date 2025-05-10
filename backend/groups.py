from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
from .models import Group
from .db import get_session  # Make sure this returns AsyncSession

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=Group)
async def create_group(group: Group, session: AsyncSession = Depends(get_session)):
    session.add(group)
    await session.commit()
    await session.refresh(group)
    return group

@router.get("/", response_model=List[Group])
async def read_groups(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Group))
    return result.scalars().all()

@router.get("/{group_id}", response_model=Group)
async def read_group(group_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.get(Group, group_id)
    if not result:
        raise HTTPException(status_code=404, detail="Group not found")
    return result

@router.delete("/{group_id}")
async def delete_group(group_id: int, session: AsyncSession = Depends(get_session)):
    group = await session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    await session.delete(group)
    await session.commit()
    return {"ok": True}