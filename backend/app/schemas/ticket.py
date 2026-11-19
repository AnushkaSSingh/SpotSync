from datetime import datetime

from pydantic import BaseModel, Field


class TicketCreateResponse(BaseModel):
    token: str
    expires_at: datetime
    message: str


class TicketValidationRequest(BaseModel):
    token: str = Field(min_length=20, max_length=256)


class TicketValidationResponse(BaseModel):
    valid: bool
    session_id: int
    parking_lot_id: int
    parking_slot_id: int
    vehicle_id: int | None
    message: str
