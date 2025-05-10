from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
from .models import Page
from .db import get_session

router = APIRouter(prefix="/pages", tags=["Pages"])

@router.post("/", response_model=Page)
async def create_page(page: Page, session: AsyncSession = Depends(get_session)):
    session.add(page)
    await session.commit()
    await session.refresh(page)
    return page

@router.get("/", response_model=List[Page])
async def read_pages(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Page))
    return result.scalars().all()

@router.get("/{page_id}", response_model=Page)
async def read_page(page_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.get(Page, page_id)
    if not result:
        raise HTTPException(status_code=404, detail="Page not found")
    return result

@router.delete("/{page_id}")
async def delete_page(page_id: int, session: AsyncSession = Depends(get_session)):
    page = await session.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    await session.delete(page)
    await session.commit()
    return {"ok": True}