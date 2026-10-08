from fastapi import APIRouter

from app.api.routes.analytics import router as analytics_router
from app.api.routes.auth import router as auth_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.parking import router as parking_router
from app.api.routes.payments import router as payments_router
from app.api.routes.predictions import router as predictions_router
from app.api.routes.recommendations import router as recommendations_router


api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(payments_router)
api_router.include_router(parking_router)
api_router.include_router(bookings_router)

api_router.include_router(predictions_router)
api_router.include_router(recommendations_router)
api_router.include_router(analytics_router)
