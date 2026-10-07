from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking_service import (
    cancel_user_booking,
    create_user_booking,
    get_booking_for_user,
    list_user_bookings,
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_user_booking(
        db=db,
        user_id=current_user.id,
        vehicle_id=booking_data.vehicle_id,
        parking_slot_id=booking_data.parking_slot_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
    )


@router.get(
    "",
    response_model=list[BookingResponse],
)
def list_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return list_user_bookings(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_booking_for_user(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id,
    )


@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return cancel_user_booking(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id,
    )
