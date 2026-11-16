from datetime import datetime, timedelta, timezone

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.parking_slot import ParkingSlot
from app.models.sensor import Sensor
from app.models.sensor_event import SensorEvent
from app.services.incident_service import incident_service


class SensorService:

    def process_event(
        self,
        db: Session,
        sensor_id: int,
        event_type: str,
        value: float | None = None,
        payload: dict | None = None,
    ):
        sensor = db.get(Sensor, sensor_id)

        if sensor is None:
            return None

        now = datetime.now(timezone.utc)
        is_offline_event = event_type == "sensor_offline"

        event = SensorEvent(
            sensor_id=sensor_id,
            event_type=event_type,
            value=value,
            payload=payload or {},
            created_at=now,
        )

        db.add(event)
        sensor.last_seen_at = now
        sensor.is_online = not is_offline_event
        db.flush()

        # Only the assigned slot can be updated by this sensor.
        slot = None
        if sensor.parking_slot_id is not None:
            slot = db.get(ParkingSlot, sensor.parking_slot_id)

        # Offline/fault events must never count as occupancy readings.
        if (
            not is_offline_event
            and slot is not None
            and event_type in {"occupied", "available"}
        ):
            recent_events = db.scalars(
                select(SensorEvent.event_type)
                .where(SensorEvent.sensor_id == sensor_id)
                .order_by(
                    SensorEvent.created_at.desc(),
                    SensorEvent.id.desc(),
                )
                .limit(3)
            ).all()

            if len(recent_events) == 3 and all(
                reading == event_type for reading in recent_events
            ):
                if event_type == "occupied":
                    slot.status = "OCCUPIED"
                    slot.is_available = False

                elif slot.status not in {"RESERVED", "OUT_OF_SERVICE"}:
                    slot.status = "AVAILABLE"
                    slot.is_available = True

        if sensor.parking_lot_id is not None:
            incident_service.detect_sensor_incident(
                db=db,
                parking_lot_id=sensor.parking_lot_id,
                event_type=event_type,
                value=value,
                sensor_id=sensor_id,
            )

        db.commit()
        db.refresh(event)

        return event

    def mark_stale_sensors_offline(
        self,
        db: Session,
        timeout_seconds: int = 120,
    ) -> int:
        """Mark online sensors offline when they stop reporting."""
        cutoff = datetime.now(timezone.utc) - timedelta(
            seconds=timeout_seconds
        )

        statement = select(Sensor).where(
            Sensor.is_online.is_(True),
            or_(
                Sensor.last_seen_at.is_(None),
                Sensor.last_seen_at < cutoff,
            ),
        )

        stale_sensors = db.scalars(statement).all()

        for sensor in stale_sensors:
            sensor.is_online = False

            if sensor.parking_lot_id is not None:
                incident_service.detect_sensor_incident(
                    db=db,
                    parking_lot_id=sensor.parking_lot_id,
                    event_type="sensor_offline",
                    sensor_id=sensor.id,
                )

        db.commit()
        return len(stale_sensors)

    def get_sensor(
        self,
        db: Session,
        sensor_id: int,
    ):
        return db.get(Sensor, sensor_id)


sensor_service = SensorService()
