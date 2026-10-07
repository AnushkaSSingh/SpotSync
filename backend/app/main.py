from contextlib import asynccontextmanager
from threading import Thread

from fastapi import FastAPI

from app.api.routes.analytics import router as analytics_router
from app.api.routes.assistant import router as assistant_router
from app.api.routes.auth import router as auth_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.parking import router as parking_router
from app.api.routes.payments import router as payments_router
from app.api.routes.predictions import router as predictions_router
from app.api.routes.recommendations import router as recommendations_router
from app.api.routes.sensors import router as sensors_router
from app.api.routes.vehicles import router as vehicles_router

from app.mqtt.client import create_mqtt_client
from app.mqtt.subscriber import on_connect, on_message

from app.tasks.scheduler import start_scheduler, stop_scheduler
from app.websocket.parking_updates import router as parking_websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    mqtt_client = None

    try:
        mqtt_client = create_mqtt_client()
        mqtt_client.on_connect = on_connect
        mqtt_client.on_message = on_message

        mqtt_thread = Thread(
            target=mqtt_client.loop_forever,
            daemon=True,
        )
        mqtt_thread.start()
        print("MQTT client started")
    except Exception as exc:
        print(f"MQTT unavailable - continuing without MQTT: {exc}")

    start_scheduler()
    yield

    if mqtt_client:
        try:
            mqtt_client.disconnect()
        except Exception:
            pass

    stop_scheduler()

app = FastAPI(
    title="SpotSync API",
    description="IoT Smart Parking Management System",
    version="1.0.0",
    lifespan=lifespan,
)


ROUTERS = [
    auth_router,
    payments_router,
    parking_router,
    bookings_router,
    predictions_router,
    recommendations_router,
    analytics_router,
    sensors_router,
    incidents_router,
    notifications_router,
    vehicles_router,
    assistant_router,
    parking_websocket_router,
]


for router in ROUTERS:
    for route in router.routes:
        app.router.routes.append(route)


@app.get("/")
def root():
    return {
        "message": "SpotSync API is running",
        "status": "ok",
    }