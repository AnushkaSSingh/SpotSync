from fastapi.testclient import TestClient

from app.main import app
from app.websocket.connection_manager import connection_manager
from app.websocket.parking_updates import publish_parking_update


def test_parking_websocket_receives_live_update():
    client = TestClient(app)
    initial_count = len(connection_manager.connections)

    with client.websocket_connect("/ws/parking") as websocket:
        assert len(connection_manager.connections) == initial_count + 1

        update = {
            "slot_id": 5,
            "slot_number": "A5",
            "status": "OCCUPIED",
            "is_available": False,
            "event_type": "occupied",
            "event_id": 101,
        }

        publish_parking_update(update)

        received = websocket.receive_json()

        assert received == {
            "type": "parking_update",
            "data": update,
        }

    assert len(connection_manager.connections) == initial_count
