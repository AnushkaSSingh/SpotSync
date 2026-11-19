
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db, require_admin
from app.models.booking import Booking
from app.models.parking_lot import ParkingLot
from app.models.parking_slot import ParkingSlot
from app.schemas.parking import (
    ParkingOverviewResponse,
    ParkingPredictionRequest,
    ParkingPredictionResponse,
    ParkingAvailabilityResponse,
)
from app.services.parking_service import parking_service
from app.services.availability_service import get_available_slots
from app.websocket.parking_updates import publish_parking_update


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


@router.get("/slots")
def get_parking_slots(
    parking_lot_id: int | None = Query(default=None, gt=0),
    available_only: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    query = (
        db.query(ParkingSlot)
        .join(ParkingLot)
        .filter(ParkingLot.is_active.is_(True))
    )

    if parking_lot_id is not None:
        lot = (
            db.query(ParkingLot)
            .filter(
                ParkingLot.id == parking_lot_id,
                ParkingLot.is_active.is_(True),
            )
            .first()
        )

        if lot is None:
            raise HTTPException(
                status_code=404,
                detail="Active parking lot not found",
            )

        query = query.filter(
            ParkingSlot.parking_lot_id == parking_lot_id
        )

    if available_only:
        query = query.filter(
            ParkingSlot.status == "AVAILABLE",
            ParkingSlot.is_available.is_(True),
        )

    slots = query.order_by(ParkingSlot.id).all()

    return {
        "count": len(slots),
        "slots": [
            {
                "id": slot.id,
                "parking_lot_id": slot.parking_lot_id,
                "slot_number": slot.slot_number,
                "slot_type": slot.slot_type,
                "is_available": (
                    slot.status == "AVAILABLE" and slot.is_available
                ),
            }
            for slot in slots
        ],
    }


@router.get("/availability", response_model=ParkingAvailabilityResponse)
def get_parking_availability(
    parking_lot_id: int = Query(..., gt=0),
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return physically available slots without overlapping active bookings."""
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
            status_code=400,
            detail="End time must be after start time",
        )

    if normalized_start < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Availability cannot be checked for a past start time",
        )

    lot = db.get(ParkingLot, parking_lot_id)
    if lot is None or not lot.is_active:
        raise HTTPException(
            status_code=404,
            detail="Active parking lot not found",
        )

    slots = get_available_slots(
        db,
        parking_lot_id,
        normalized_start,
        normalized_end,
    )

    return {
        "parking_lot_id": parking_lot_id,
        "start_time": normalized_start,
        "end_time": normalized_end,
        "count": len(slots),
        "slots": [
            {
                "id": slot.id,
                "parking_lot_id": slot.parking_lot_id,
                "slot_number": slot.slot_number,
                "slot_type": slot.slot_type,
                "status": slot.status,
                "is_available": slot.is_available,
            }
            for slot in slots
        ],
    }


@router.get("/live")
def live_parking_status(
    db: Session = Depends(get_db),
):
    lots = parking_service.get_parking_overview(db)

    total_slots = sum(lot["total_slots"] for lot in lots)
    occupied_slots = sum(lot["occupied_slots"] for lot in lots)
    available_slots = sum(lot["available_slots"] for lot in lots)

    occupancy_rate = (
        round((occupied_slots / total_slots) * 100, 2)
        if total_slots
        else 0
    )

    return {
        "total_slots": total_slots,
        "occupied_slots": occupied_slots,
        "available_slots": available_slots,
        "occupancy_rate": occupancy_rate,
        "parking_lots": lots,
    }


class SlotAvailabilityUpdate(BaseModel):
    is_available: bool


@router.patch("/slots/{slot_id}")
def update_slot_availability(
    slot_id: int,
    request: SlotAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    slot = db.get(ParkingSlot, slot_id)

    if slot is None:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found",
        )

    if request.is_available:
        now = datetime.now(timezone.utc)

        active_booking = (
            db.query(Booking)
            .filter(
                Booking.parking_slot_id == slot_id,
                Booking.status.in_(["pending", "confirmed"]),
                Booking.start_time <= now,
                Booking.end_time > now,
            )
            .first()
        )

        if active_booking is not None:
            raise HTTPException(
                status_code=409,
                detail="Cannot mark this slot available while a booking is active",
            )

        if slot.status in {"RESERVED", "OCCUPIED", "OUT_OF_SERVICE"}:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot mark a {slot.status} slot as available directly",
            )

        slot.status = "AVAILABLE"
        slot.is_available = True

    else:
        slot.is_available = False

        if slot.status == "AVAILABLE":
            slot.status = "UNKNOWN"

    try:
        db.commit()
        db.refresh(slot)
    except Exception:
        db.rollback()
        raise

    publish_parking_update(
        {
            "slot_id": slot.id,
            "slot_number": slot.slot_number,
            "status": slot.status,
            "is_available": slot.is_available,
            "event_type": "admin_update",
        }
    )

    return {
        "id": slot.id,
        "parking_lot_id": slot.parking_lot_id,
        "slot_number": slot.slot_number,
        "slot_type": slot.slot_type,
        "is_available": slot.is_available,
    }
