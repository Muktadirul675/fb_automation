import os
import asyncio
from . import auth
from . import posts
from . import users
from . import medias
from . import groups
from . import pages
from . import comments
from . import reactions
from . import proxies
from . import ws
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
UPLOAD_DIR = "medias"
os.makedirs(UPLOAD_DIR, exist_ok=True)

origins = [
    "http://localhost",
    "http://localhost:5173",  # for frontend like React/Next.js
    "http://localhost:4173",  # for frontend like React/Next.js
    "http://localhost:3000",  # for frontend like React/Next.js
    "https://glamorousgift.com/",  # production domain
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # List of allowed origins
    allow_credentials=True,         # Allow cookies and credentials
    allow_methods=["*"],            # Allow all HTTP methods
    allow_headers=["*"],            # Allow all headers
)


app.mount("/medias", StaticFiles(directory="medias"), name="medias")

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(medias.router)
app.include_router(groups.router)
app.include_router(pages.router)
app.include_router(comments.router)
app.include_router(reactions.router)
app.include_router(proxies.router)
app.include_router(ws.router)

@app.on_event('startup')
async def startup():
    asyncio.create_task(ws.post_manager.create_bridge())

@app.get('/')
async def home(name:str|None='mahi'):
    return f"hello {name}"
