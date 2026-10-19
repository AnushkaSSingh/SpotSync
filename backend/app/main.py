
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.api.routes import auth, bookings, parking, payments, analytics
from app.api.routes.health import router as health_router

app = FastAPI(
    title="SpotSync API",
    description="Smart parking management API",
    version="1.0.0",
)

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

configured_origins = os.getenv("FRONTEND_ORIGINS", "")

frontend_origins = [
    origin.strip().rstrip("/")
    for origin in configured_origins.split(",")
    if origin.strip()
]

allowed_origins = list(dict.fromkeys(default_origins + frontend_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health-check endpoints
app.include_router(health_router)

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
