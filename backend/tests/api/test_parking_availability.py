from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_db
from app.api.routes import parking
from app.main import app


client = TestClient(app)


def setup_dependencies():
    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: SimpleNamespace(
        get=lambda model, object_id: SimpleNamespace(
            id=object_id,
            is_active=True,
        )
    )


def clear_dependencies():
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)


def test_availability_returns_slots_for_requested_time(monkeypatch):
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=2)
    slot = SimpleNamespace(
        id=3,
        parking_lot_id=2,
        slot_number="A3",
        slot_type="regular",
        status="AVAILABLE",
        is_available=True,
    )
    calls = {}

    def fake_get_available_slots(db, lot_id, start_time, end_time):
        calls["lot_id"] = lot_id
        calls["start_time"] = start_time
        calls["end_time"] = end_time
        return [slot]

    monkeypatch.setattr(parking, "get_available_slots", fake_get_available_slots)
    setup_dependencies()
    try:
        response = client.get(
            "/api/parking/availability",
            params={
                "parking_lot_id": 2,
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
            },
        )
    finally:
        clear_dependencies()

    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["slots"][0]["slot_number"] == "A3"
    assert calls["lot_id"] == 2


def test_availability_rejects_invalid_time_range():
    start = datetime.now(timezone.utc) + timedelta(days=1)
    setup_dependencies()
    try:
        response = client.get(
            "/api/parking/availability",
            params={
                "parking_lot_id": 2,
                "start_time": start.isoformat(),
                "end_time": start.isoformat(),
            },
        )
    finally:
        clear_dependencies()

    assert response.status_code == 400
    assert response.json()["detail"] == "End time must be after start time"


def test_availability_rejects_inactive_parking_lot():
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=2)
    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: SimpleNamespace(
        get=lambda model, object_id: SimpleNamespace(
            id=object_id,
            is_active=False,
        )
    )
    try:
        response = client.get(
            "/api/parking/availability",
            params={
                "parking_lot_id": 2,
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
            },
        )
    finally:
        clear_dependencies()

    assert response.status_code == 404
    assert response.json()["detail"] == "Active parking lot not found"


def test_availability_requires_authentication():
    start = datetime.now(timezone.utc) + timedelta(days=1)
    end = start + timedelta(hours=2)
    clear_dependencies()

    response = client.get(
        "/api/parking/availability",
        params={
            "parking_lot_id": 2,
            "start_time": start.isoformat(),
            "end_time": end.isoformat(),
        },
    )

    assert response.status_code == 401
