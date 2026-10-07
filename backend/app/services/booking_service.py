from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.repositories.booking_repository import (
    create_booking,
    get_booking_by_id,
    get_overlapping_booking,
    get_user_bookings,
    update_booking_status,
)
from app.repositories.parking_repository import get_parking_lot_by_id
from app.models.parking_slot import ParkingSlot


def create_user_booking(
    db: Session,
    user_id: int,
    vehicle_id: int,
    parking_slot_id: int,
    start_time,
    end_time,
):
    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    slot = db.get(ParkingSlot, parking_slot_id)

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking slot not found",
        )

    if not slot.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parking slot is not available",
        )

    parking_lot = get_parking_lot_by_id(db, slot.parking_lot_id)

    if not parking_lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found",
        )

    overlapping_booking = get_overlapping_booking(
        db,
        parking_slot_id,
        start_time,
        end_time,
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Parking slot is already booked for this time",
        )

    duration_hours = Decimal(
        str((end_time - start_time).total_seconds() / 3600)
    )

    total_amount = duration_hours * Decimal("50.00")

    booking = create_booking(
        db=db,
        user_id=user_id,
        vehicle_id=vehicle_id,
        parking_slot_id=parking_slot_id,
        start_time=start_time,
        end_time=end_time,
        total_amount=total_amount,
    )

    db.commit()
    db.refresh(booking)

    return booking


def get_booking_for_user(
    db: Session,
    booking_id: int,
    user_id: int,
):
    booking = get_booking_by_id(db, booking_id)

    if not booking or booking.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    return booking


def list_user_bookings(
    db: Session,
    user_id: int,
):
    return get_user_bookings(db, user_id)


def cancel_user_booking(
    db: Session,
    booking_id: int,
    user_id: int,
):
    booking = get_booking_for_user(db, booking_id, user_id)

    if booking.status in ["cancelled", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled",
        )

    booking = update_booking_status(
        db,
        booking,
        "cancelled",
    )

    db.commit()
    db.refresh(booking)

    return booking
