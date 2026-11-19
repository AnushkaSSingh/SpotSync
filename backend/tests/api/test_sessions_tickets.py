from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_db
from app.api.routes import sessions, tickets
from app.main import app

client = TestClient(app)


def set_dependencies(user_id=7, role="user"):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=user_id, role=role
    )
    app.dependency_overrides[get_db] = lambda: None


def clear_dependencies():
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)


def make_session():
    now = datetime.now(timezone.utc)
    return SimpleNamespace(
        id=101,
        parking_lot_id=2,
        parking_slot_id=3,
        user_id=7,
        vehicle_id=4,
        status="ACTIVE",
        started_at=now,
        ended_at=None,
    )


def test_session_entry_route(monkeypatch):
    calls = {}
    monkeypatch.setattr(
        sessions,
        "start_parking_session",
        lambda db, **kwargs: calls.update(kwargs) or make_session(),
    )
    set_dependencies()
    try:
        response = client.post(
            "/api/sessions/entry",
            json={"parking_slot_id": 3, "vehicle_id": 4},
        )
    finally:
        clear_dependencies()

    assert response.status_code == 201
    assert response.json()["id"] == 101
    assert calls["user_id"] == 7
    assert calls["parking_slot_id"] == 3
    assert calls["vehicle_id"] == 4


def test_session_exit_route(monkeypatch):
    monkeypatch.setattr(
        sessions, "end_parking_session",
        lambda db, **kwargs: make_session(),
    )
    set_dependencies()
    try:
        response = client.post("/api/sessions/101/exit")
    finally:
        clear_dependencies()

    assert response.status_code == 200
    assert response.json()["id"] == 101


def test_list_sessions_route(monkeypatch):
    monkeypatch.setattr(
        sessions, "get_user_parking_sessions",
        lambda db, user_id: [make_session()],
    )
    set_dependencies()
    try:
        response = client.get("/api/sessions")
    finally:
        clear_dependencies()

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == 101


def test_create_ticket_route(monkeypatch):
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    monkeypatch.setattr(
        tickets, "generate_session_ticket",
        lambda db, **kwargs: {
            "token": "sample-secure-ticket-token-123456",
            "expires_at": expires_at,
            "message": "Ticket created",
        },
    )
    set_dependencies()
    try:
        response = client.post("/api/tickets/sessions/101")
    finally:
        clear_dependencies()

    assert response.status_code == 200
    assert response.json()["token"] == "sample-secure-ticket-token-123456"


def test_validate_ticket_route_requires_admin(monkeypatch):
    monkeypatch.setattr(
        tickets, "validate_session_ticket",
        lambda db, token: {
            "valid": True,
            "session_id": 101,
            "parking_lot_id": 2,
            "parking_slot_id": 3,
            "vehicle_id": 4,
            "message": "Ticket validated successfully.",
        },
    )
    set_dependencies(role="admin")
    try:
        response = client.post(
            "/api/tickets/validate",
            json={"token": "sample-secure-ticket-token-123456"},
        )
    finally:
        clear_dependencies()

    assert response.status_code == 200
    assert response.json()["valid"] is True


def test_regular_user_cannot_validate_ticket():
    set_dependencies(role="user")
    try:
        response = client.post(
            "/api/tickets/validate",
            json={"token": "sample-secure-ticket-token-123456"},
        )
    finally:
        clear_dependencies()

    assert response.status_code == 403
