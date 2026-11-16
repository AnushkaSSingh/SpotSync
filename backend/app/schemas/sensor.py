from pydantic import BaseModel, ConfigDict, Field


class SensorEventRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sensor_id: str = Field(..., min_length=1, max_length=100)
    slot_id: str = Field(..., min_length=1, max_length=100)
    status: str = Field(..., min_length=1, max_length=100)
    distance_cm: float
    timestamp: str = Field(..., min_length=1)


class SensorEventResponse(BaseModel):
    id: int
    sensor_id: int
    event_type: str
    value: float | None
    payload: dict
