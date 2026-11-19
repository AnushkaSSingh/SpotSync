from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SessionEntryRequest(BaseModel):
    parking_slot_id: int = Field(gt=0)
    vehicle_id: int = Field(gt=0)
    booking_id: int | None = Field(default=None, gt=0)


class ParkingSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parking_lot_id: int
    parking_slot_id: int
    user_id: int | None
    vehicle_id: int | None
    status: str
    started_at: datetime
    ended_at: datetime | None
