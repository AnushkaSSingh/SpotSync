from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.parking_lot import ParkingLot
from app.models.parking_slot import ParkingSlot


def get_active_parking_lots(db: Session):
    return db.scalars(
        select(ParkingLot)
        .where(ParkingLot.is_active.is_(True))
        .order_by(ParkingLot.id)
    ).all()


def get_parking_lot_by_id(
    db: Session,
    parking_lot_id: int,
):
    return db.scalar(
        select(ParkingLot).where(
            ParkingLot.id == parking_lot_id,
            ParkingLot.is_active.is_(True),
        )
    )


def get_parking_slots(
    db: Session,
    parking_lot_id: int,
):
    return db.scalars(
        select(ParkingSlot)
        .where(ParkingSlot.parking_lot_id == parking_lot_id)
        .order_by(ParkingSlot.id)
    ).all()


def get_available_parking_slots(
    db: Session,
    parking_lot_id: int,
):
    return db.scalars(
        select(ParkingSlot)
        .where(
            ParkingSlot.parking_lot_id == parking_lot_id,
            ParkingSlot.is_available.is_(True),
        )
        .order_by(ParkingSlot.id)
    ).all()