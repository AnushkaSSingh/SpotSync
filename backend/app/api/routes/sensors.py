import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.config import settings
from app.mqtt.message_handler import process_sensor_payload
from app.schemas.sensor import (
    SensorEventRequest,
    SensorEventResponse,
)


router = APIRouter(
    prefix="/sensors",
    tags=["Sensors"],
)


@router.post(
    "/events",
    response_model=SensorEventResponse,
)
def process_sensor_event(
    request: SensorEventRequest,
    sensor_token: str | None = Header(default=None, alias="X-Sensor-Token"),
    db: Session = Depends(get_db),
):
    configured_token = settings.sensor_ingestion_token

    if not configured_token:
        raise HTTPException(
            status_code=503,
            detail="Sensor ingestion is not configured",
        )

    if sensor_token is None or not secrets.compare_digest(
        sensor_token, configured_token
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid sensor authentication token",
        )

    event = process_sensor_payload(
        db=db,
        data=request.model_dump(),
    )

    if event is None:
        raise HTTPException(
            status_code=422,
            detail=(
                "Sensor event rejected. Check that the sensor is registered, "
                "assigned to the claimed slot, and sending a supported event."
            ),
        )

    return {
        "id": event.id,
        "sensor_id": event.sensor_id,
        "event_type": event.event_type,
        "value": event.value,
        "payload": event.payload,
    }
