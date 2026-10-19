from fastapi import APIRouter

from app.api.routes import (
    auth,
    bookings,
    parking,
    payments,
    predictions,
    recommendations,
    analytics,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(bookings.router)
api_router.include_router(parking.router)
api_router.include_router(payments.router)
api_router.include_router(predictions.router)
api_router.include_router(recommendations.router)
api_router.include_router(analytics.router)
