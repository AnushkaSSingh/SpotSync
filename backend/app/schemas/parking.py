from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ParkingSlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parking_lot_id: int
    slot_number: str
    slot_type: str
    is_available: bool


class ParkingLotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    total_slots: int
    is_active: bool


class ParkingLotDetailResponse(ParkingLotResponse):
    slots: list[ParkingSlotResponse]