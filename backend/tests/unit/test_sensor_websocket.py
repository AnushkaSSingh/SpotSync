from datetime import datetime, timezone, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.mqtt import message_handler


def make_payload(sensor_id="S1", slot_id="A1", status="occupied"):
    return {
        "sensor_id": sensor_id,
        "slot_id": slot_id,
        "status": status,
        "distance_cm": 10.0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def make_database(sensor_type="parking", assigned_slot_id=20):
    slot = SimpleNamespace(
        id=20,
        slot_number="A1",
        display_code="A1",
        status="OCCUPIED",
        is_available=False,
    )
    sensor = SimpleNamespace(
        id=1,
        sensor_code="S1",
        sensor_type=sensor_type,
        parking_slot_id=assigned_slot_id,
    )

    db = MagicMock()
    db.scalar.return_value = sensor
    db.get.return_value = slot
    db.refresh.side_effect = lambda obj: None

    return db, sensor, slot


def test_valid_sensor_event_publishes_parking_update(monkeypatch):
    db, sensor, slot = make_database()
    event = SimpleNamespace(id=101)

    monkeypatch.setattr(
        message_handler.sensor_service,
        "process_event",
        lambda **kwargs: event,
    )

    publisher = MagicMock()
    monkeypatch.setattr(
        message_handler,
        "publish_parking_update",
        publisher,
    )

    result = message_handler.process_sensor_payload(
        db,
        make_payload(),
    )

    assert result is event
    publisher.assert_called_once_with({
        "slot_id": 20,
        "slot_number": "A1",
        "status": "OCCUPIED",
        "is_available": False,
        "event_type": "occupied",
        "event_id": 101,
    })


def test_invalid_sensor_event_does_not_publish(monkeypatch):
    db, sensor, slot = make_database()

    publisher = MagicMock()
    monkeypatch.setattr(
        message_handler,
        "publish_parking_update",
        publisher,
    )

    payload = make_payload()
    payload["slot_id"] = "WRONG-SLOT"

    result = message_handler.process_sensor_payload(db, payload)

    assert result is None
    publisher.assert_not_called()


def test_entrance_sensor_does_not_publish_slot_update(monkeypatch):
    db, sensor, slot = make_database(
        sensor_type="entrance_exit",
        assigned_slot_id=None,
    )
    sensor.sensor_code = "SENSOR_008"
    event = SimpleNamespace(id=102)

    monkeypatch.setattr(
        message_handler.sensor_service,
        "process_event",
        lambda **kwargs: event,
    )

    publisher = MagicMock()
    monkeypatch.setattr(
        message_handler,
        "publish_parking_update",
        publisher,
    )

    payload = make_payload(
        sensor_id="SENSOR_008",
        slot_id=None,
        status="entry_detected",
    )

    result = message_handler.process_sensor_payload(db, payload)

    assert result is event
    publisher.assert_not_called()


def test_stale_sensor_event_is_rejected_without_broadcast(monkeypatch):
    db, sensor, slot = make_database()

    publisher = MagicMock()
    monkeypatch.setattr(
        message_handler,
        "publish_parking_update",
        publisher,
    )

    payload = make_payload()
    payload["timestamp"] = (
        datetime.now(timezone.utc) - timedelta(hours=1)
    ).isoformat()

    result = message_handler.process_sensor_payload(db, payload)

    assert result is None
    publisher.assert_not_called()


def test_mqtt_handler_uses_shared_sensor_processing(monkeypatch):
    db = MagicMock()
    event = SimpleNamespace(id=103)
    payload = make_payload()

    processor = MagicMock(return_value=event)
    monkeypatch.setattr(
        message_handler,
        "process_sensor_payload",
        processor,
    )

    import json

    result = message_handler.handle_sensor_message(
        db,
        json.dumps(payload).encode("utf-8"),
    )

    assert result is True
    processor.assert_called_once_with(db, payload)
