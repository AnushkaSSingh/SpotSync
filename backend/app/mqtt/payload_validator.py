from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SensorPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sensor_id: str = Field(min_length=1, max_length=100)
    # Parking sensors must provide slot_id; entrance sensors must omit it.
    slot_id: str | None = Field(default=None, min_length=1, max_length=100)
    status: str = Field(min_length=1, max_length=100)
    distance_cm: float
    timestamp: datetime
