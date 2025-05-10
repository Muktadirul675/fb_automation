from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from enum import Enum
from datetime import datetime
from redis.asyncio import Redis
import asyncio
from datetime import datetime
from typing import Any
from fastapi import WebSocket
import copy
from .db import get_session_sync

router = APIRouter()
redis = Redis()

class Action(str, Enum):
    postprocess_create = "postprocess.create"
    post_create = "post.create"
    post_update = "post.update"

# Connection Manager

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print("New Connection")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(self._serialize_datetimes(message))

    async def broadcast(self, message: dict):
        serialized = self._serialize_datetimes(message)
        for connection in self.active_connections:
            await connection.send_json(serialized)

    def _serialize_datetimes(self, obj: Any) -> Any:
        if isinstance(obj, dict):
            return {k: self._serialize_datetimes(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_datetimes(i) for i in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return obj
    

class PostManager:
    def __init__(self,manager: ConnectionManager):
        self.manager = manager
        
    async def create_bridge(self):
        pubsub = redis.pubsub()
        await pubsub.subscribe(Action.post_update)

        async for message in pubsub.listen():
            if message["type"] == "message":
                await self.manager.broadcast({
                    "action":Action.post_update,
                    "data": {"id":message['data'].decode()}
                })
    
manager = ConnectionManager()
post_manager = PostManager(manager)

# WebSocket Endpoint
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()  # Receive JSON
            # await manager.send_personal_message({"message": f"You sent: {data}"}, websocket)
            # await manager.broadcast({"broadcast": f"Broadcast: {data}"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # await manager.broadcast({"message": "A user disconnected."})