from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.connection_manager import connection_manager


router = APIRouter(
    prefix="/ws",
    tags=["WebSocket"],
)


def publish_parking_update(data: dict):
    """Publish a trusted backend parking update to connected clients."""
    connection_manager.broadcast_from_sync(
        {
            "type": "parking_update",
            "data": data,
        }
    )


@router.websocket("/parking")
async def parking_updates(websocket: WebSocket):
    await connection_manager.connect(websocket)

    try:
        while True:
            # Keep the connection alive; client messages are not broadcast.
            await websocket.receive_text()

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
