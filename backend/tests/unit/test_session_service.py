from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.services import session_service


def setup_entry(monkeypatch, status="AVAILABLE", available=True, active=None):
    db = MagicMock()
    db.get.side_effect = [
        SimpleNamespace(user_id=1),
        SimpleNamespace(is_active=True),
    ]
    slot = SimpleNamespace(
        id=20, parking_lot_id=30,
        status=status, is_available=available,
    )
    monkeypatch.setattr(session_service, "get_slot_for_update", lambda *a: slot)
    monkeypatch.setattr(session_service, "get_active_session_for_slot", lambda *a: active)
    return db, slot


def test_drive_in_entry_succeeds(monkeypatch):
    db, _ = setup_entry(monkeypatch)
    created = SimpleNamespace(id=101, status="ACTIVE")
    db.scalar.return_value = None
    monkeypatch.setattr(session_service, "create_session", lambda *a, **kw: created)

    result = session_service.start_parking_session(
        db, user_id=1, parking_slot_id=20, vehicle_id=10
    )

    assert result is created
    assert db.commit.call_count == 2


def test_entry_rejects_vehicle_owned_by_another_user():
    db = MagicMock()
    db.get.return_value = SimpleNamespace(user_id=2)

    with pytest.raises(HTTPException) as exc:
        session_service.start_parking_session(
            db, user_id=1, parking_slot_id=20, vehicle_id=10
        )

    assert exc.value.status_code == 404


def test_entry_rejects_unavailable_slot(monkeypatch):
    db, _ = setup_entry(monkeypatch, status="UNKNOWN", available=False)

    with pytest.raises(HTTPException) as exc:
        session_service.start_parking_session(
            db, user_id=1, parking_slot_id=20, vehicle_id=10
        )

    assert exc.value.status_code == 409


def test_entry_rejects_existing_active_session(monkeypatch):
    db, _ = setup_entry(monkeypatch, active=SimpleNamespace(id=99))

    with pytest.raises(HTTPException) as exc:
        session_service.start_parking_session(
            db, user_id=1, parking_slot_id=20, vehicle_id=10
        )

    assert exc.value.status_code == 409


def test_booking_entry_succeeds_for_owner_with_confirmed_booking(monkeypatch):
    now = datetime.now(timezone.utc)
    booking = SimpleNamespace(
        user_id=1, parking_slot_id=20, vehicle_id=10,
        status="confirmed",
        start_time=now - timedelta(minutes=5),
        end_time=now + timedelta(hours=1),
    )
    db = MagicMock()
    db.get.side_effect = [
        SimpleNamespace(user_id=1),
        SimpleNamespace(is_active=True),
        booking,
    ]
    slot = SimpleNamespace(
        id=20, parking_lot_id=30, status="RESERVED", is_available=False
    )
    monkeypatch.setattr(session_service, "get_slot_for_update", lambda *a: slot)
    monkeypatch.setattr(session_service, "get_active_session_for_slot", lambda *a: None)
    created = SimpleNamespace(id=102, status="ACTIVE")
    monkeypatch.setattr(session_service, "create_session", lambda *a, **kw: created)

    result = session_service.start_parking_session(
        db, user_id=1, parking_slot_id=20, vehicle_id=10, booking_id=55
    )

    assert result is created
    assert db.commit.call_count == 2


def test_booking_entry_rejects_pending_booking(monkeypatch):
    now = datetime.now(timezone.utc)
    booking = SimpleNamespace(
        user_id=1, parking_slot_id=20, vehicle_id=10,
        status="pending",
        start_time=now - timedelta(minutes=5),
        end_time=now + timedelta(hours=1),
    )
    db = MagicMock()
    db.get.side_effect = [
        SimpleNamespace(user_id=1),
        SimpleNamespace(is_active=True),
        booking,
    ]
    slot = SimpleNamespace(
        id=20, parking_lot_id=30, status="AVAILABLE", is_available=True
    )
    monkeypatch.setattr(session_service, "get_slot_for_update", lambda *a: slot)
    monkeypatch.setattr(session_service, "get_active_session_for_slot", lambda *a: None)

    with pytest.raises(HTTPException) as exc:
        session_service.start_parking_session(
            db, user_id=1, parking_slot_id=20, vehicle_id=10, booking_id=55
        )

    assert exc.value.status_code == 409


def test_exit_completes_session_without_releasing_slot(monkeypatch):
    session = SimpleNamespace(status="ACTIVE", ended_at=None)
    db = MagicMock()
    monkeypatch.setattr(
        session_service, "get_session_for_user_for_update",
        lambda *a: session,
    )

    result = session_service.end_parking_session(
        db, session_id=101, user_id=1
    )

    assert result.status == "COMPLETED"
    assert result.ended_at is not None
    assert db.commit.call_count == 2
    db.get.assert_not_called()


def test_exit_rejects_session_not_owned_by_user(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(
        session_service, "get_session_for_user_for_update",
        lambda *a: None,
    )

    with pytest.raises(HTTPException) as exc:
        session_service.end_parking_session(
            db, session_id=101, user_id=1
        )

    assert exc.value.status_code == 404
