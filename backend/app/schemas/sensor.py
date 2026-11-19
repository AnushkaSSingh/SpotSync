from pydantic import BaseModel, ConfigDict, Field


class SensorEventRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sensor_id: str = Field(..., min_length=1, max_length=100)
    # Optional at schema level because the entrance sensor (S8) has no slot.
    # The message handler enforces the role-specific requirement.
    slot_id: str | None = Field(default=None, min_length=1, max_length=100)
    status: str = Field(..., min_length=1, max_length=100)
    distance_cm: float
    timestamp: str = Field(..., min_length=1)


class SensorEventResponse(BaseModel):
    id: int
    sensor_id: int
    event_type: str
    value: float | None
    payload: dict
