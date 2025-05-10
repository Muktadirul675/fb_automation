from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from contextlib import contextmanager

DATABASE_URL = "sqlite+aiosqlite:///database.db"

engine = create_async_engine(DATABASE_URL)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

sync_engine = create_engine("sqlite:///database.db", echo=True)
sync_session = sessionmaker(sync_engine, autoflush=False)
sync_engine_celery = create_engine("sqlite:///./backend/database.db")
sync_session_celery = sessionmaker(sync_engine_celery, autoflush=False)

@contextmanager
def get_session_celery()->Session:
    session : Session = sync_session_celery()
    try:
        yield session
    finally:
        session.close()

@contextmanager
def get_session_sync() -> Session:
    session : Session = sync_session()
    try:
        yield session
    finally:
        session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
        