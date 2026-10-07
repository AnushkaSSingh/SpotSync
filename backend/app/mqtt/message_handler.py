import json

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.mqtt.payload_validator import SensorPayload
from app.services.sensor_service import update_slot_from_sensor


def handle_sensor_message(
    db: Session,
    payload: bytes,
) -> bool:
    try:
        data = json.loads(payload.decode("utf-8"))
        sensor_payload = SensorPayload.model_validate(data)
    except (json.JSONDecodeError, UnicodeDecodeError, ValidationError):
        return False

    return update_slot_from_sensor(
        db=db,
        slot_id=sensor_payload.slot_id,
        status=sensor_payload.status,
    )