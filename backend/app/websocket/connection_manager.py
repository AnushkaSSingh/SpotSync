import asyncio

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.connections: list[WebSocket] = []
        self.loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.loop = asyncio.get_running_loop()
        self.connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []

        for connection in self.connections.copy():
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

    def broadcast_from_sync(self, message: dict):
        loop = self.loop
        if loop is None or loop.is_closed():
            return

        asyncio.run_coroutine_threadsafe(
            self.broadcast(message),
            loop,
        )


connection_manager = ConnectionManager()
