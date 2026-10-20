import os
import secrets

from fastapi import APIRouter, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.parking_lot import ParkingLot
from app.models.parking_slot import ParkingSlot

router = APIRouter()

@router.post("/internal/seed-parking")
def seed_parking(x_seed_secret: str | None = Header(default=None)):
    expected = os.getenv("PARKING_SEED_SECRET")
    if not expected or not x_seed_secret or not secrets.compare_digest(x_seed_secret, expected):
        raise HTTPException(status_code=404, detail="Not found")

    db: Session = SessionLocal()
    try:
        if db.query(ParkingLot).count() > 0:
            return {"message": "Parking lots already exist; no data added"}

        lots = [
            ParkingLot(name="City Center Parking", address="City Center, Ghaziabad", total_slots=10, is_active=True),
            ParkingLot(name="Metro Plaza Parking", address="Metro Plaza, Ghaziabad", total_slots=10, is_active=True),
            ParkingLot(name="Tech Park Parking", address="Tech Park, Ghaziabad", total_slots=10, is_active=True),
        ]
        db.add_all(lots)
        db.flush()

        available = [7, 4, 8]
        for lot, count in zip(lots, available):
            db.add_all([
                ParkingSlot(
                    parking_lot_id=lot.id,
                    slot_number=f"S{i:02}",
                    is_available=i <= count,
                )
                for i in range(1, 11)
            ])

        db.commit()
        return {"message": "Sample parking data added", "lots": 3, "slots": 30}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
