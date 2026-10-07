from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.analytics import ParkingAnalyticsResponse
from app.services.analytics_service import analytics_service


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/parking/{parking_lot_id}",
    response_model=ParkingAnalyticsResponse,
)
def get_parking_analytics(
    parking_lot_id: int,
    db: Session = Depends(get_db),
):
    return analytics_service.get_parking_analytics(
        db=db,
        parking_lot_id=parking_lot_id,
    )
