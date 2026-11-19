from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

from app.tasks import booking_expiry


def test_expire_pending_bookings_updates_and_commits():
    db = MagicMock()
    booking = MagicMock()
    booking.status = "pending"
    db.scalars.return_value.all.return_value = [booking]

    now = datetime.now(timezone.utc)
    result = booking_expiry.expire_pending_bookings(db, now=now)

    assert result == 1
    assert booking.status == "expired"
    db.commit.assert_called_once()
    db.rollback.assert_not_called()


def test_expire_pending_bookings_does_not_commit_when_none_found():
    db = MagicMock()
    db.scalars.return_value.all.return_value = []

    result = booking_expiry.expire_pending_bookings(
        db,
        now=datetime.now(timezone.utc),
    )

    assert result == 0
    db.commit.assert_not_called()


def test_expire_pending_bookings_rolls_back_on_error():
    db = MagicMock()
    db.scalars.side_effect = RuntimeError("Database error")

    with pytest.raises(RuntimeError, match="Database error"):
        booking_expiry.expire_pending_bookings(
            db,
            now=datetime.now(timezone.utc),
        )

    db.rollback.assert_called_once()
    db.commit.assert_not_called()


def test_run_booking_expiry_closes_session(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(booking_expiry, "SessionLocal", lambda: db)
    monkeypatch.setattr(
        booking_expiry,
        "expire_pending_bookings",
        lambda session: 3,
    )

    result = booking_expiry.run_booking_expiry()

    assert result == 3
    db.close.assert_called_once()
