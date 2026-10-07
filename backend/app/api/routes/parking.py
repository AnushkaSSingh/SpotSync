from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.repositories.parking_repository import (
    get_active_parking_lots,
    get_available_parking_slots,
    get_parking_lot_by_id,
    get_parking_slots,
)
from app.schemas.parking import (
    ParkingLotDetailResponse,
    ParkingLotResponse,
    ParkingSlotResponse,
)

router = APIRouter(
    prefix="/parking",
    tags=["Parking"],
)


@router.get(
    "",
    response_model=list[ParkingLotResponse],
)
def list_parking_lots(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_active_parking_lots(db)


@router.get(
    "/{parking_lot_id}",
    response_model=ParkingLotDetailResponse,
)
def get_parking_lot(
    parking_lot_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    parking_lot = get_parking_lot_by_id(db, parking_lot_id)

    if not parking_lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found",
        )

    return {
        **parking_lot.__dict__,
        "slots": get_parking_slots(db, parking_lot_id),
    }


@router.get(
    "/{parking_lot_id}/slots",
    response_model=list[ParkingSlotResponse],
)
def list_parking_slots(
    parking_lot_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    parking_lot = get_parking_lot_by_id(db, parking_lot_id)

    if not parking_lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found",
        )

    return get_parking_slots(db, parking_lot_id)


@router.get(
    "/{parking_lot_id}/slots/available",
    response_model=list[ParkingSlotResponse],
)
def list_available_parking_slots(
    parking_lot_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    parking_lot = get_parking_lot_by_id(db, parking_lot_id)

    if not parking_lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found",
        )

    return get_available_parking_slots(db, parking_lot_id)