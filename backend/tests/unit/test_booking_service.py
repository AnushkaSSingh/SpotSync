
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from sqlalchemy.dialects import postgresql
from fastapi import HTTPException

from app.services import booking_service


def future_range():
    start = datetime.now(timezone.utc) + timedelta(days=1)
    return start, start + timedelta(hours=2)


def test_booking_rejects_vehicle_owned_by_another_user():
    db = MagicMock()
    db.get.return_value = SimpleNamespace(user_id=2)
    start, end = future_range()

    with pytest.raises(HTTPException) as exc:
        booking_service.create_user_booking(
            db,
            user_id=1,
            vehicle_id=10,
            parking_slot_id=20,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 404


def test_booking_rejects_past_start_time():
    db = MagicMock()
    start = datetime.now(timezone.utc) - timedelta(hours=1)
    end = start + timedelta(hours=2)

    with pytest.raises(HTTPException) as exc:
        booking_service.create_user_booking(
            db,
            user_id=1,
            vehicle_id=10,
            parking_slot_id=20,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 400
    db.get.assert_not_called()


def test_booking_rejects_unavailable_slot():
    db = MagicMock()
    db.get.return_value = SimpleNamespace(user_id=1)
    db.scalar.return_value = SimpleNamespace(
        is_available=False,
        status="AVAILABLE",
    )
    start, end = future_range()

    with pytest.raises(HTTPException) as exc:
        booking_service.create_user_booking(
            db,
            user_id=1,
            vehicle_id=10,
            parking_slot_id=20,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 400
    assert exc.value.detail == "Parking slot is not available"


@pytest.mark.parametrize(
    "slot_status",
    ["RESERVED", "OCCUPIED", "UNKNOWN", "OUT_OF_SERVICE"],
)
def test_booking_rejects_non_available_status(slot_status):
    db = MagicMock()
    db.get.return_value = SimpleNamespace(user_id=1)
    db.scalar.return_value = SimpleNamespace(
        is_available=True,
        status=slot_status,
    )
    start, end = future_range()

    with pytest.raises(HTTPException) as exc:
        booking_service.create_user_booking(
            db,
            user_id=1,
            vehicle_id=10,
            parking_slot_id=20,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 400
    assert exc.value.detail == "Parking slot is not available"


def test_booking_rejects_overlapping_reservation(monkeypatch):
    db = MagicMock()
    vehicle = SimpleNamespace(user_id=1)
    slot = SimpleNamespace(
        is_available=True,
        status="AVAILABLE",
        parking_lot_id=30,
    )

    db.get.return_value = vehicle
    db.scalar.return_value = slot

    monkeypatch.setattr(
        booking_service,
        "get_parking_lot_by_id",
        lambda *args: SimpleNamespace(id=30),
    )
    monkeypatch.setattr(
        booking_service,
        "get_overlapping_booking",
        lambda *args: SimpleNamespace(id=99),
    )

    start, end = future_range()

    with pytest.raises(HTTPException) as exc:
        booking_service.create_user_booking(
            db,
            user_id=1,
            vehicle_id=10,
            parking_slot_id=20,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 409
    assert exc.value.detail == "Parking slot is already booked for this time"

    locking_query = db.scalar.call_args.args[0]
    compiled_query = str(
        locking_query.compile(dialect=postgresql.dialect())
    )
    assert "FOR UPDATE" in compiled_query


def test_user_cannot_access_another_users_booking(monkeypatch):
    db = MagicMock()
    booking = SimpleNamespace(user_id=2)

    monkeypatch.setattr(
        booking_service,
        "get_booking_by_id",
        lambda *args: booking,
    )

    with pytest.raises(HTTPException) as exc:
        booking_service.get_booking_for_user(db, 1, 1)

    assert exc.value.status_code == 404


def test_automatic_booking_selects_first_available_slot(monkeypatch):
    db = MagicMock()
    slots = [
        SimpleNamespace(id=10),
        SimpleNamespace(id=11),
    ]
    db.scalars.return_value.all.return_value = slots

    monkeypatch.setattr(
        booking_service,
        "get_parking_lot_by_id",
        lambda *args: SimpleNamespace(id=5),
    )
    monkeypatch.setattr(
        booking_service,
        "get_overlapping_booking",
        lambda db, slot_id, start, end: None,
    )

    expected_booking = SimpleNamespace(id=100, parking_slot_id=10)
    create_mock = MagicMock(return_value=expected_booking)
    monkeypatch.setattr(
        booking_service,
        "create_user_booking",
        create_mock,
    )

    start, end = future_range()

    result = booking_service.create_automatically_allocated_booking(
        db=db,
        user_id=1,
        vehicle_id=20,
        parking_lot_id=5,
        start_time=start,
        end_time=end,
    )

    assert result is expected_booking
    assert create_mock.call_args.kwargs["parking_slot_id"] == 10


def test_automatic_booking_skips_slot_with_overlapping_booking(monkeypatch):
    db = MagicMock()
    slots = [
        SimpleNamespace(id=10),
        SimpleNamespace(id=11),
    ]
    db.scalars.return_value.all.return_value = slots

    monkeypatch.setattr(
        booking_service,
        "get_parking_lot_by_id",
        lambda *args: SimpleNamespace(id=5),
    )

    def find_overlap(db, slot_id, start, end):
        return SimpleNamespace(id=99) if slot_id == 10 else None

    monkeypatch.setattr(
        booking_service,
        "get_overlapping_booking",
        find_overlap,
    )

    create_mock = MagicMock(return_value=SimpleNamespace(id=101))
    monkeypatch.setattr(
        booking_service,
        "create_user_booking",
        create_mock,
    )

    start, end = future_range()

    booking_service.create_automatically_allocated_booking(
        db=db,
        user_id=1,
        vehicle_id=20,
        parking_lot_id=5,
        start_time=start,
        end_time=end,
    )

    assert create_mock.call_args.kwargs["parking_slot_id"] == 11


def test_automatic_booking_rejects_when_no_slots_are_available(monkeypatch):
    db = MagicMock()
    db.scalars.return_value.all.return_value = []

    monkeypatch.setattr(
        booking_service,
        "get_parking_lot_by_id",
        lambda *args: SimpleNamespace(id=5),
    )

    start, end = future_range()

    with pytest.raises(HTTPException) as exc:
        booking_service.create_automatically_allocated_booking(
            db=db,
            user_id=1,
            vehicle_id=20,
            parking_lot_id=5,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 409
    db.rollback.assert_called_once()


def test_automatic_booking_rejects_inactive_parking_lot(monkeypatch):
    db = MagicMock()

    monkeypatch.setattr(
        booking_service,
        "get_parking_lot_by_id",
        lambda *args: None,
    )

    start, end = future_range()

    with pytest.raises(HTTPException) as exc:
        booking_service.create_automatically_allocated_booking(
            db=db,
            user_id=1,
            vehicle_id=20,
            parking_lot_id=5,
            start_time=start,
            end_time=end,
        )

    assert exc.value.status_code == 404
    db.scalars.assert_not_called()
