from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.parking_slot import ParkingSlot


def update_slot_from_sensor(
    db: Session,
    slot_id: str,
    status: str,
) -> bool:
    slot = db.scalar(
        select(ParkingSlot).where(
            ParkingSlot.slot_number == slot_id
        )
    )

    if not slot:
        return False

    if status not in {"occupied", "available"}:
        return False

    slot.is_available = status == "available"

    db.commit()

    return True