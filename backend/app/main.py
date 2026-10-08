from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, bookings, parking, payments

app = FastAPI(
    title="SpotSync API",
    description="Backend API for SpotSync parking management and booking",
    version="1.0.0",
)

# CORS configuration
# Allows the Vite frontend to communicate with the FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth.router)
app.include_router(parking.router)
app.include_router(bookings.router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {
        "message": "SpotSync API is running",
        "docs": "/docs",
    }