from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.schemas.session import (
    ParkingSessionResponse,
    SessionEntryRequest,
)
from app.services.session_service import (
    end_parking_session,
    get_user_parking_sessions,
    start_parking_session,
)


router = APIRouter(prefix="/sessions", tags=["Parking Sessions"])


@router.post(
    "/entry",
    response_model=ParkingSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def vehicle_entry(
    request: SessionEntryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return start_parking_session(
        db,
        user_id=current_user.id,
        parking_slot_id=request.parking_slot_id,
        vehicle_id=request.vehicle_id,
        booking_id=request.booking_id,
    )


@router.post(
    "/{session_id}/exit",
    response_model=ParkingSessionResponse,
)
def vehicle_exit(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return end_parking_session(
        db,
        session_id=session_id,
        user_id=current_user.id,
    )


@router.get(
    "",
    response_model=list[ParkingSessionResponse],
)
def list_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_parking_sessions(db, current_user.id)
