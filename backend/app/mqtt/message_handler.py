import json
from datetime import datetime, timezone

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.parking_slot import ParkingSlot
from app.models.sensor import Sensor
from app.mqtt.payload_validator import SensorPayload
from app.services.sensor_service import sensor_service


ALLOWED_SENSOR_EVENTS = {
    "occupied",
    "available",
    "fault",
    "blocked",
    "sensor_offline",
    "unexpected_occupancy",
}


def process_sensor_payload(db: Session, data: dict):
    """Validate a sensor report and process it only for its registered slot."""
    try:
        sensor_payload = SensorPayload.model_validate(data)
    except ValidationError:
        return None

    reading_time = sensor_payload.timestamp

    # Device timestamps must include a timezone.
    if reading_time.tzinfo is None or reading_time.utcoffset() is None:
        return None

    now = datetime.now(timezone.utc)
    age_seconds = (now - reading_time.astimezone(timezone.utc)).total_seconds()

    if age_seconds > settings.sensor_stale_after_seconds:
        return None

    if age_seconds < -settings.sensor_max_future_skew_seconds:
        return None

    sensor_code = sensor_payload.sensor_id.strip()
    claimed_slot = sensor_payload.slot_id.strip()
    event_type = sensor_payload.status.strip().lower()

    if not sensor_code or not claimed_slot:
        return None

    if event_type not in ALLOWED_SENSOR_EVENTS:
        return None

    sensor = db.scalar(
        select(Sensor).where(Sensor.sensor_code == sensor_code)
    )

    if sensor is None or sensor.parking_slot_id is None:
        return None

    assigned_slot = db.get(ParkingSlot, sensor.parking_slot_id)

    if assigned_slot is None:
        return None

    valid_slot_codes = {
        code
        for code in (assigned_slot.slot_number, assigned_slot.display_code)
        if code
    }

    if claimed_slot not in valid_slot_codes:
        return None

    return sensor_service.process_event(
        db=db,
        sensor_id=sensor.id,
        event_type=event_type,
        value=sensor_payload.distance_cm,
        payload=data,
    )


def handle_sensor_message(db: Session, payload: bytes) -> bool:
    """MQTT adapter: decode the message and use shared sensor validation."""
    try:
        data = json.loads(payload.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return False

    if not isinstance(data, dict):
        return False

    return process_sensor_payload(db, data) is not None
