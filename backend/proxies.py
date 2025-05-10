from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from .db import get_session
from .models import Proxy  # Main Proxy model from models.py

# --- Pydantic models ---
class ProxyCreate(SQLModel):
    hostname: str
    port: int
    password: str
    active: Optional[bool] = True

class ProxyRead(SQLModel):
    id: int
    hostname: str
    port: int
    active: bool

class ProxyUpdate(SQLModel):
    hostname: Optional[str] = None
    port: Optional[int] = None
    password: Optional[str] = None
    active: Optional[bool] = None

# --- APIRouter setup ---
router = APIRouter(prefix="/proxies", tags=["Proxies"])

@router.post("/", response_model=ProxyRead)
async def create_proxy(data: ProxyCreate, session: AsyncSession = Depends(get_session)):
    proxy = Proxy.from_orm(data)
    session.add(proxy)
    await session.commit()
    await session.refresh(proxy)
    return proxy

@router.get("/", response_model=List[ProxyRead])
async def get_all_proxies(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Proxy))
    return result.scalars().all()

@router.get("/{proxy_id}", response_model=ProxyRead)
async def get_proxy(proxy_id: int, session: AsyncSession = Depends(get_session)):
    proxy = await session.get(Proxy, proxy_id)
    if not proxy:
        raise HTTPException(status_code=404, detail="Proxy not found")
    return proxy

@router.put("/{proxy_id}", response_model=ProxyRead)
async def update_proxy(proxy_id: int, data: ProxyUpdate, session: AsyncSession = Depends(get_session)):
    proxy = await session.get(Proxy, proxy_id)
    if not proxy:
        raise HTTPException(status_code=404, detail="Proxy not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(proxy, key, value)

    await session.commit()
    await session.refresh(proxy)
    return proxy

@router.delete("/{proxy_id}")
async def delete_proxy(proxy_id: int, session: AsyncSession = Depends(get_session)):
    proxy = await session.get(Proxy, proxy_id)
    if not proxy:
        raise HTTPException(status_code=404, detail="Proxy not found")

    await session.delete(proxy)
    await session.commit()
    return {"detail": "Proxy deleted successfully"}