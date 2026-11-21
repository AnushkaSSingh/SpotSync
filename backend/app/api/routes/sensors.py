import secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.core.config import settings
from app.mqtt.message_handler import process_sensor_payload
from app.models.sensor import Sensor
from app.models.sensor_event import SensorEvent
from app.models.parking_slot import ParkingSlot
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


@router.get("/latest")
def get_latest_sensor_readings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return the latest persisted reading for each registered sensor."""
    rows = db.execute(
        select(SensorEvent, Sensor, ParkingSlot)
        .join(Sensor, Sensor.id == SensorEvent.sensor_id)
        .outerjoin(ParkingSlot, ParkingSlot.id == Sensor.parking_slot_id)
        .order_by(SensorEvent.created_at.desc(), SensorEvent.id.desc())
    ).all()
    latest = {}
    for event, sensor, slot in rows:
        if sensor.id in latest:
            continue
        payload = event.payload or {}
        latest[sensor.id] = {
            "sensor_id": sensor.sensor_code or str(sensor.id),
            "sensor_db_id": sensor.id,
            "slot_id": slot.id if slot else None,
            "slot_number": (slot.display_code or slot.slot_number) if slot else None,
            "status": event.event_type.upper(),
            "distance_cm": payload.get("distance_cm", event.value),
            "timestamp": event.created_at.isoformat() if event.created_at else None,
            "is_online": bool(sensor.is_online),
        }
    return {"readings": list(latest.values())}
