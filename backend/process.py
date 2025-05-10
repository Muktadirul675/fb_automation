from fastapi import APIRouter
from models import PostProcess

router = APIRouter(prefix="/processes", tags=["Processes"])

@router.get("/")
async def get_all_processes():
    pass