import os
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from .config import settings
from .db import get_session
import httpx
from .models import User
from .db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from sqlmodel import Session, select, delete

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])

class PictureData(BaseModel):
    url : str

class UserPicture(BaseModel):
    data : PictureData

class UserData(BaseModel):
    id : str
    name : str
    picture: UserPicture

@router.get("/login/facebook")
async def facebook_login():
    app_id = settings.facebook_client_id
    redirect_uri = "http://localhost:8000/auth/callback/facebook"
    login_uri = f"https://www.facebook.com/v22.0/dialog/oauth?client_id={app_id}&redirect_uri={redirect_uri}&state=st"
    
    return RedirectResponse(login_uri)

@router.get("/callback/facebook", response_model=User)
async def facebook_callback(code: Optional[str], session:AsyncSession = Depends(get_session)):
    redirect_uri = "http://localhost:8000/auth/callback/facebook"
    if not code:
        return {"error": "Missing code"}

    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_res = await client.get(
            "https://graph.facebook.com/v22.0/oauth/access_token",
            params={
                "client_id": settings.facebook_client_id,
                "redirect_uri": redirect_uri,
                "client_secret": settings.facebook_client_secret,
                "code": code,
            }
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return {"error": "Access token not found", "details": token_data}

        # Fetch user info
        user_res = await client.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,name,email,picture",
                "access_token": access_token,
            }
        )
        user_data  = user_res.json()
        
        result = await session.execute(select(User).where(User.fb_id == user_data['id']))
        user = result.scalar_one_or_none()
        
        if user is None:
            user = User(fb_id=user_data['id'], name=user_data['name'],picture=user_data['picture']['data']['url'], email="needs_fb_integration@domain", access_token=access_token)
            session.add(user)
            await session.commit()
            await session.refresh(user)
        
        fb_get_pages_uri = f"https://graph.facebook.com/v22.0/{user_data['id']}/accounts"
        
        pages_res = await client.get(
            fb_get_pages_uri,
            params={
                "access_token": access_token,
            }
        )

        return user

    
