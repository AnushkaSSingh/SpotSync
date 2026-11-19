from datetime import datetime

from pydantic import BaseModel, Field


class ParkingOverviewItem(BaseModel):
    id: int
    name: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    total_slots: int
    occupied_slots: int
    available_slots: int
    occupancy_rate: float


class ParkingOverviewResponse(BaseModel):
    parking_lots: list[ParkingOverviewItem]


class ParkingPredictionRequest(BaseModel):
    parking_lot_id: int = Field(..., gt=0)
    hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)


class ParkingPredictionResponse(BaseModel):
    parking_lot_id: int
    name: str
    current_occupancy: float
    predicted_occupancy: float
    predicted_percentage: float
    available_percentage: float
    status: str


class ParkingAvailabilitySlot(BaseModel):
    id: int
    parking_lot_id: int
    slot_number: str
    slot_type: str
    status: str
    is_available: bool


class ParkingAvailabilityResponse(BaseModel):
    parking_lot_id: int
    start_time: datetime
    end_time: datetime
    count: int
    slots: list[ParkingAvailabilitySlot]
