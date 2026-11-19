from datetime import datetime, timezone

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.models.booking import Booking


def create_booking(
    db: Session,
    user_id: int,
    vehicle_id: int,
    parking_slot_id: int,
    start_time: datetime,
    end_time: datetime,
    total_amount,
    expires_at=None,
):
    booking = Booking(
        user_id=user_id,
        vehicle_id=vehicle_id,
        parking_slot_id=parking_slot_id,
        start_time=start_time,
        end_time=end_time,
        total_amount=total_amount,
        expires_at=expires_at,
    )

    db.add(booking)
    db.flush()
    db.refresh(booking)

    return booking


def get_booking_by_id(
    db: Session,
    booking_id: int,
):
    return db.scalar(
        select(Booking).where(Booking.id == booking_id)
    )


def get_user_bookings(
    db: Session,
    user_id: int,
):
    return db.scalars(
        select(Booking)
        .where(Booking.user_id == user_id)
        .order_by(Booking.created_at.desc())
    ).all()


def get_overlapping_booking(
    db: Session,
    parking_slot_id: int,
    start_time: datetime,
    end_time: datetime,
):
    return db.scalar(
        select(Booking).where(
            Booking.parking_slot_id == parking_slot_id,
            or_(
                Booking.status == "confirmed",
                and_(
                    Booking.status == "pending",
                    or_(
                        Booking.expires_at.is_(None),
                        Booking.expires_at > datetime.now(timezone.utc),
                    ),
                ),
            ),
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        )
    )


def update_booking_status(
    db: Session,
    booking: Booking,
    status: str,
):
    booking.status = status
    db.flush()
    db.refresh(booking)

    return booking
