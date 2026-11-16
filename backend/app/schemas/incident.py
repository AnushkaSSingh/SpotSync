from pydantic import BaseModel, ConfigDict


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    parking_lot_id: int
    sensor_id: int | None = None
    incident_type: str
    severity: str
    status: str
    description: str


class IncidentListResponse(BaseModel):
    incidents: list[IncidentResponse]
