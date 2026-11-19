
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models.booking import Booking
from app.models.payment import Payment
from app.repositories.booking_repository import (
    create_booking,
    get_booking_by_id,
    get_overlapping_booking,
    get_user_bookings,
    update_booking_status,
)
from app.repositories.parking_repository import get_parking_lot_by_id
from app.models.parking_slot import ParkingSlot
from app.models.vehicle import Vehicle
from app.services.notification_service import notification_service


def create_user_booking(
    db: Session,
    user_id: int,
    vehicle_id: int,
    parking_slot_id: int,
    start_time,
    end_time,
):
    normalized_start = (
        start_time.replace(tzinfo=timezone.utc)
        if start_time.tzinfo is None else start_time
    )
    normalized_end = (
        end_time.replace(tzinfo=timezone.utc)
        if end_time.tzinfo is None else end_time
    )

    if normalized_start >= normalized_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    now = datetime.now(timezone.utc)
    if normalized_start < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot start in the past",
        )

    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None or vehicle.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    slot = db.scalar(
        select(ParkingSlot)
        .where(ParkingSlot.id == parking_slot_id)
        .with_for_update()
    )

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking slot not found",
        )

    if slot.status != "AVAILABLE" or not slot.is_available:
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
        normalized_start,
        normalized_end,
    )

    if overlapping_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Parking slot is already booked for this time",
        )

    duration_hours = Decimal(
        str((normalized_end - normalized_start).total_seconds() / 3600)
    )

    # Match the existing booking UI options; amounts are still calculated server-side.
    parking_rates = {
        Decimal("2"): Decimal("60.00"),
        Decimal("4"): Decimal("120.00"),
        Decimal("24"): Decimal("250.00"),
    }

    whole_hours = duration_hours.quantize(Decimal("1"))

    if duration_hours != whole_hours or duration_hours <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking duration must be a positive whole number of hours",
        )

    parking_fee = parking_rates.get(
        whole_hours,
        whole_hours * Decimal("30.00"),
    )
    total_amount = parking_fee + Decimal("10.00")

    booking = create_booking(
        db=db,
        user_id=user_id,
        vehicle_id=vehicle_id,
        parking_slot_id=parking_slot_id,
        start_time=normalized_start,
        end_time=normalized_end,
        total_amount=total_amount,
        expires_at=now + timedelta(
            minutes=settings.booking_checkout_expiry_minutes
        ),
    )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot conflicts with another reservation. Please choose another time or slot.",
        ) from exc

    db.refresh(booking)

    notification_service.create_safely(
        db,
        user_id,
        "Booking request received",
        f"Your booking request for parking slot {parking_slot_id} has been received. "
        "It is pending payment confirmation.",
        "info",
    )

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
    """Cancel a booking; simulate refunds only for eligible mock payments."""
    booking = get_booking_for_user(db, booking_id, user_id)

    if booking.status in ["cancelled", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled",
        )

    captured_payment = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking.id,
            Payment.status.in_(["paid", "partially_refunded"]),
        )
        .order_by(Payment.id.desc())
        .first()
    )

    demo_refund_simulated = False

    if captured_payment is not None:
        is_allowed_local_demo = (
            settings.payment_mode.strip().lower() == "mock"
            and settings.app_env.strip().lower() == "development"
            and settings.allow_mock_payments
            and (captured_payment.razorpay_order_id or "").startswith("mock_order_")
            and (captured_payment.razorpay_payment_id or "").startswith("mock_payment_")
        )

        if not is_allowed_local_demo:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This booking has a real or non-demo captured payment. "
                    "No cancellation or refund was performed; use the authorized refund process."
                ),
            )

        captured_payment.status = "refunded"
        demo_refund_simulated = True

    booking = update_booking_status(db, booking, "cancelled")

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booking could not be cancelled because of a database conflict",
        ) from exc

    db.refresh(booking)

    notification_service.create_safely(
        db,
        user_id,
        "Booking cancelled",
        f"Your booking #{booking.id} has been cancelled.",
        "info",
    )

    return booking, demo_refund_simulated


def create_automatically_allocated_booking(
    db: Session,
    user_id: int,
    vehicle_id: int,
    parking_lot_id: int,
    start_time: datetime,
    end_time: datetime,
):
    if get_parking_lot_by_id(db, parking_lot_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active parking lot not found",
        )

    candidates = db.scalars(
        select(ParkingSlot)
        .where(
            ParkingSlot.parking_lot_id == parking_lot_id,
            ParkingSlot.status == "AVAILABLE",
            ParkingSlot.is_available.is_(True),
        )
        .order_by(ParkingSlot.id)
        .with_for_update(skip_locked=True)
    ).all()

    for slot in candidates:
        overlapping_booking = get_overlapping_booking(
            db,
            slot.id,
            start_time,
            end_time,
        )

        if overlapping_booking is None:
            return create_user_booking(
                db=db,
                user_id=user_id,
                vehicle_id=vehicle_id,
                parking_slot_id=slot.id,
                start_time=start_time,
                end_time=end_time,
            )

    db.rollback()
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="No available parking slot for the selected time",
    )
