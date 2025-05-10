from fastapi import FastAPI, File, UploadFile, APIRouter, Request, Depends
from .db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import os
from .models import Media, MediaType

UPLOAD_DIR = "medias"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix='/upload',tags=["Medias"])

@router.post("/")
async def upload_media(request: Request, files: list[UploadFile] = File(...), session: AsyncSession = Depends(get_session)):
    uploaded_files = []

    for file in files:
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        if file.content_type.startswith("image/"):
            type_of = MediaType.image
        elif file.content_type.startswith("video/"):
            type_of = MediaType.video
        else:
            type_of = "unknown"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        base_url = str(request.base_url).rstrip("/")
        media_url = f"{base_url}/medias/{file.filename}"
        new_media = Media(url=media_url, type_of=type_of)
        session.add(new_media)
        await session.flush()
        uploaded_files.append({
            "id": new_media.id,
            "filename": file.filename,
            "url": media_url
        })
        
    await session.commit()
    return {"files": uploaded_files}

@router.post("/check")
async def check():
    return "all ok"