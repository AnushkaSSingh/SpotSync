
from datetime import datetime, timezone

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.parking_lot import ParkingLot
from app.models.parking_slot import ParkingSlot


def _active_booking_filter(now):
    return or_(
        Booking.status == "confirmed",
        and_(
            Booking.status == "pending",
            or_(
                Booking.expires_at.is_(None),
                Booking.expires_at > now,
            ),
        ),
    )


def is_slot_available(
    db: Session,
    parking_slot_id: int,
    start_time: datetime,
    end_time: datetime,
) -> bool:
    """Return whether a slot has no overlapping active booking."""
    if start_time >= end_time:
        raise ValueError("End time must be after start time")

    slot = db.get(ParkingSlot, parking_slot_id)

    if (
        slot is None
        or slot.status != "AVAILABLE"
        or not slot.is_available
    ):
        return False

    lot = db.get(ParkingLot, slot.parking_lot_id)
    if lot is None or not lot.is_active:
        return False

    overlap = (
        db.query(Booking.id)
        .filter(
            Booking.parking_slot_id == parking_slot_id,
            _active_booking_filter(datetime.now(timezone.utc)),
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        )
        .first()
    )

    return overlap is None


def get_available_slots(
    db: Session,
    parking_lot_id: int,
    start_time: datetime,
    end_time: datetime,
) -> list[ParkingSlot]:
    """Return available slots in an active parking lot for a time range."""
    if start_time >= end_time:
        raise ValueError("End time must be after start time")

    lot = db.get(ParkingLot, parking_lot_id)
    if lot is None or not lot.is_active:
        return []

    slots = (
        db.query(ParkingSlot)
        .filter(
            ParkingSlot.parking_lot_id == parking_lot_id,
            ParkingSlot.status == "AVAILABLE",
            ParkingSlot.is_available.is_(True),
        )
        .order_by(ParkingSlot.id)
        .all()
    )

    available = []
    for slot in slots:
        overlap = (
            db.query(Booking.id)
            .filter(
                Booking.parking_slot_id == slot.id,
                _active_booking_filter(datetime.now(timezone.utc)),
                Booking.start_time < end_time,
                Booking.end_time > start_time,
            )
            .first()
        )

        if overlap is None:
            available.append(slot)

    return available
