from fastapi import APIRouter

from app.api.routes import (
    incidents,
    analytics,
    auth,
    bookings,
    parking,
    payments,
    predictions,
    recommendations,
    sensors,
    vehicles,
)

api_router = APIRouter(prefix="/api")
api_router.include_router(incidents.router)
api_router.include_router(auth.router)
api_router.include_router(bookings.router)
api_router.include_router(parking.router)
api_router.include_router(payments.router)
api_router.include_router(vehicles.router)
api_router.include_router(predictions.router)
api_router.include_router(recommendations.router)
api_router.include_router(analytics.router)

api_router.include_router(sensors.router)

from app.api.navigation import router as navigation_router
api_router.include_router(navigation_router)
