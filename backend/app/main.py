import os

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.database.neo4j import initialize_neo4j, close_neo4j
from app.mqtt.subscriber import start_mqtt_subscriber, stop_mqtt_subscriber
from app.services.sensor_health_monitor import (
    start_sensor_health_monitor,
    stop_sensor_health_monitor,
)
from app.api.routes import auth, bookings, parking, payments, analytics
from app.api.routes.health import router as health_router
from app.websocket.parking_updates import router as websocket_router

app = FastAPI(
    title="SpotSync API",
    description="Smart parking management API",
    version="1.0.0",
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://spot-sync-seven.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health-check endpoints
app.include_router(health_router)
app.include_router(websocket_router)

# Shared API routes, including predictions and recommendations
app.include_router(api_router)

# Legacy routes retained for existing frontend compatibility
app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "SpotSync API is running"}



@app.on_event("startup")
def start_optional_mqtt():
    start_sensor_health_monitor()
    initialize_neo4j()
    if settings.mqtt_enabled:
        start_mqtt_subscriber()


@app.on_event("shutdown")
def stop_optional_mqtt():
    stop_mqtt_subscriber()
    stop_sensor_health_monitor()
    close_neo4j()
