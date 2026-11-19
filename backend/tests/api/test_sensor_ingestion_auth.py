from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api.routes import sensors
from app.main import app


def sensor_payload():
    return {
        "sensor_id": "S1",
        "slot_id": "A1",
        "status": "occupied",
        "distance_cm": 10.0,
        "timestamp": "2026-11-19T10:00:00+00:00",
    }


def test_sensor_event_rejects_request_without_token(monkeypatch):
    monkeypatch.setattr(sensors.settings, "sensor_ingestion_token", "test-secret")
    client = TestClient(app)

    response = client.post("/api/sensors/events", json=sensor_payload())

    assert response.status_code == 401


def test_sensor_event_rejects_incorrect_token(monkeypatch):
    monkeypatch.setattr(sensors.settings, "sensor_ingestion_token", "test-secret")
    client = TestClient(app)

    response = client.post(
        "/api/sensors/events",
        json=sensor_payload(),
        headers={"X-Sensor-Token": "wrong-secret"},
    )

    assert response.status_code == 401


def test_sensor_event_rejects_when_server_token_is_not_configured(monkeypatch):
    monkeypatch.setattr(sensors.settings, "sensor_ingestion_token", "")
    client = TestClient(app)

    response = client.post(
        "/api/sensors/events",
        json=sensor_payload(),
        headers={"X-Sensor-Token": "some-secret"},
    )

    assert response.status_code == 503


def test_sensor_event_accepts_valid_token(monkeypatch):
    monkeypatch.setattr(sensors.settings, "sensor_ingestion_token", "test-secret")
    monkeypatch.setattr(
        sensors,
        "process_sensor_payload",
        lambda db, data: SimpleNamespace(
            id=501,
            sensor_id=1,
            event_type="occupied",
            value=10.0,
            payload=data,
        ),
    )

    client = TestClient(app)
    response = client.post(
        "/api/sensors/events",
        json=sensor_payload(),
        headers={"X-Sensor-Token": "test-secret"},
    )

    assert response.status_code == 200
    assert response.json()["id"] == 501
    assert response.json()["event_type"] == "occupied"
