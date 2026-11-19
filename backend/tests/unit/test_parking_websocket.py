from types import SimpleNamespace
from unittest.mock import MagicMock

from app.api.routes import parking


def test_admin_slot_update_broadcasts_after_commit(monkeypatch):
    slot = SimpleNamespace(
        id=20,
        parking_lot_id=10,
        slot_number="A1",
        slot_type="regular",
        status="AVAILABLE",
        is_available=True,
    )
    db = MagicMock()
    db.get.return_value = slot
    publisher = MagicMock()

    monkeypatch.setattr(parking, "publish_parking_update", publisher)

    response = parking.update_slot_availability(
        slot_id=20,
        request=parking.SlotAvailabilityUpdate(is_available=False),
        db=db,
        current_user=SimpleNamespace(role="admin"),
    )

    db.commit.assert_called_once()
    publisher.assert_called_once_with(
        {
            "slot_id": 20,
            "slot_number": "A1",
            "status": "UNKNOWN",
            "is_available": False,
            "event_type": "admin_update",
        }
    )
    assert response["is_available"] is False
