import logging
from threading import Event, Thread

from app.core.config import settings
from app.core.database import SessionLocal
from app.services.sensor_service import sensor_service


logger = logging.getLogger(__name__)

_stop_event = Event()
_monitor_thread = None


def _monitor_sensors():
    interval = max(5, settings.sensor_health_check_interval_seconds)

    while not _stop_event.wait(interval):
        db = SessionLocal()

        try:
            count = sensor_service.mark_stale_sensors_offline(
                db,
                timeout_seconds=settings.sensor_stale_after_seconds,
            )

            if count:
                logger.warning(
                    "Marked %s stale parking sensors offline.",
                    count,
                )

        except Exception:
            db.rollback()
            logger.exception("Sensor health check failed.")

        finally:
            db.close()


def start_sensor_health_monitor():
    global _monitor_thread

    if _monitor_thread is not None and _monitor_thread.is_alive():
        return

    _stop_event.clear()
    _monitor_thread = Thread(
        target=_monitor_sensors,
        name="spotsync-sensor-health",
        daemon=True,
    )
    _monitor_thread.start()
    logger.info("Sensor health monitor started.")


def stop_sensor_health_monitor():
    global _monitor_thread

    if _monitor_thread is None:
        return

    _stop_event.set()
    _monitor_thread.join(timeout=5)
    _monitor_thread = None
    logger.info("Sensor health monitor stopped.")
