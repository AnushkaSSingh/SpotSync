from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.main import app
from app.mqtt import message_handler
from app.websocket.connection_manager import connection_manager


def test_sensor_event_reaches_connected_websocket(monkeypatch):
    client = TestClient(app)

    sensor = SimpleNamespace(
        id=1,
        sensor_code="S1",
        sensor_type="parking",
        parking_slot_id=20,
    )

    slot = SimpleNamespace(
        id=20,
        slot_number="A1",
        display_code="A1",
        status="OCCUPIED",
        is_available=False,
    )

    event = SimpleNamespace(id=501)

    db = MagicMock()
    db.scalar.return_value = sensor
    db.get.return_value = slot
    db.refresh.side_effect = lambda obj: None

    monkeypatch.setattr(
        message_handler.sensor_service,
        "process_event",
        lambda **kwargs: event,
    )

    initial_count = len(connection_manager.connections)

    with client.websocket_connect("/ws/parking") as websocket:
        assert len(connection_manager.connections) == initial_count + 1

        payload = {
            "sensor_id": "S1",
            "slot_id": "A1",
            "status": "occupied",
            "distance_cm": 10.0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        result = message_handler.process_sensor_payload(db, payload)

        assert result is event

        received = websocket.receive_json()

        assert received == {
            "type": "parking_update",
            "data": {
                "slot_id": 20,
                "slot_number": "A1",
                "status": "OCCUPIED",
                "is_available": False,
                "event_type": "occupied",
                "event_id": 501,
            },
        }

    assert len(connection_manager.connections) == initial_count
