from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.parking import (
    ParkingOverviewResponse,
    ParkingPredictionRequest,
    ParkingPredictionResponse,
)
from app.services.parking_service import parking_service


router = APIRouter(prefix="/parking", tags=["Parking"])


@router.get("/overview", response_model=ParkingOverviewResponse)
def get_parking_overview(
    db: Session = Depends(get_db),
):
    parking_lots = parking_service.get_parking_overview(db)

    return {
        "parking_lots": parking_lots,
    }


@router.post(
    "/predict",
    response_model=ParkingPredictionResponse,
)
def predict_parking(
    request: ParkingPredictionRequest,
    db: Session = Depends(get_db),
):
    prediction = parking_service.predict_parking_occupancy(
        db=db,
        parking_lot_id=request.parking_lot_id,
        hour=request.hour,
        day_of_week=request.day_of_week,
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Parking lot not found",
        )

    return prediction
