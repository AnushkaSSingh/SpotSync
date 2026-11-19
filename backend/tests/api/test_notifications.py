from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_db
from app.main import app
from app.services.notification_service import notification_service


client = TestClient(app)


def test_get_notifications_returns_current_users_notifications(monkeypatch):
    notification = SimpleNamespace(
        id=1,
        user_id=7,
        title="Booking confirmed",
        message="Your parking booking is confirmed.",
        notification_type="success",
        is_read=False,
    )

    calls = {}

    def fake_get_notifications(db, user_id):
        calls["user_id"] = user_id
        return [notification]

    monkeypatch.setattr(
        notification_service,
        "get_user_notifications",
        fake_get_notifications,
    )

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        response = client.get("/api/notifications")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert calls["user_id"] == 7
    assert response.json()["notifications"][0]["title"] == "Booking confirmed"
    assert response.json()["notifications"][0]["is_read"] is False


def test_get_notifications_returns_empty_list(monkeypatch):
    monkeypatch.setattr(
        notification_service,
        "get_user_notifications",
        lambda db, user_id: [],
    )

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=12)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        response = client.get("/api/notifications")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json() == {"notifications": []}


def test_mark_notification_as_read(monkeypatch):
    notification = SimpleNamespace(
        id=3,
        user_id=7,
        title="Booking confirmed",
        message="Your booking is confirmed.",
        notification_type="success",
        is_read=True,
    )

    calls = {}

    def fake_mark_as_read(db, notification_id, user_id):
        calls["notification_id"] = notification_id
        calls["user_id"] = user_id
        return notification

    monkeypatch.setattr(
        notification_service,
        "mark_as_read",
        fake_mark_as_read,
    )

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        response = client.patch("/api/notifications/3/read")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert calls["notification_id"] == 3
    assert calls["user_id"] == 7
    assert response.json()["is_read"] is True


def test_mark_notification_as_read_returns_404_when_not_found(monkeypatch):
    monkeypatch.setattr(
        notification_service,
        "mark_as_read",
        lambda db, notification_id, user_id: None,
    )

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        response = client.patch("/api/notifications/999/read")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"



def test_get_unread_notification_count(monkeypatch):
    calls = {}

    def fake_get_unread_count(db, user_id):
        calls["user_id"] = user_id
        return 4

    monkeypatch.setattr(
        notification_service,
        "get_unread_count",
        fake_get_unread_count,
    )

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        response = client.get("/api/notifications/unread-count")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json() == {"unread_count": 4}
    assert calls["user_id"] == 7



def test_mark_all_notifications_as_read(monkeypatch):
    calls = {}

    def fake_mark_all_as_read(db, user_id):
        calls["user_id"] = user_id
        return 3

    monkeypatch.setattr(
        notification_service,
        "mark_all_as_read",
        fake_mark_all_as_read,
    )

    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(id=7)
    )
    app.dependency_overrides[get_db] = lambda: None

    try:
        response = client.post("/api/notifications/read-all")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)

    assert response.status_code == 200
    assert response.json() == {"updated_count": 3}
    assert calls["user_id"] == 7
