from unittest.mock import MagicMock

from app.models.incident import Incident
from app.repositories.incident_repository import create_incident


def test_create_incident_flushes_without_committing():
    db = MagicMock()
    db.scalar.return_value = None

    incident = create_incident(
        db=db,
        parking_lot_id=1,
        incident_type="sensor_failure",
        severity="high",
        description="Parking sensor is offline.",
        sensor_id=101,
    )

    assert isinstance(incident, Incident)
    assert incident.sensor_id == 101
    assert incident.incident_type == "sensor_failure"
    db.add.assert_called_once_with(incident)
    db.flush.assert_called_once()
    db.commit.assert_not_called()


def test_create_incident_reuses_existing_open_sensor_incident():
    db = MagicMock()
    existing = MagicMock()
    db.scalar.return_value = existing

    result = create_incident(
        db=db,
        parking_lot_id=1,
        incident_type="sensor_failure",
        severity="high",
        description="Parking sensor is offline.",
        sensor_id=101,
    )

    assert result is existing
    db.add.assert_not_called()
    db.flush.assert_not_called()
    db.commit.assert_not_called()
