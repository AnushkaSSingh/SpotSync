import logging

from app.core.config import settings
from app.core.database import SessionLocal
from app.mqtt.client import create_mqtt_client
from app.mqtt.message_handler import handle_sensor_message
from app.mqtt.topics import ENTRANCE_EVENT_TOPIC, OCCUPANCY_TOPIC

logger = logging.getLogger(__name__)

MQTT_TOPIC = OCCUPANCY_TOPIC.replace("{slot_id}", "+")
MQTT_TOPICS = (MQTT_TOPIC, ENTRANCE_EVENT_TOPIC)
_mqtt_client = None


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        for topic in MQTT_TOPICS:
            client.subscribe(topic)
            logger.info("Subscribed to MQTT topic %s", topic)
    else:
        logger.error("MQTT connection failed: %s", reason_code)


def on_message(client, userdata, msg):
    db = SessionLocal()
    try:
        success = handle_sensor_message(db, msg.payload)
        if success:
            logger.info("Processed sensor message: %s", msg.topic)
        else:
            logger.warning("Rejected sensor message: %s", msg.topic)
    except Exception:
        db.rollback()
        logger.exception("Error processing MQTT message: %s", msg.topic)
    finally:
        db.close()


def start_mqtt_subscriber():
    global _mqtt_client

    if _mqtt_client is not None:
        return

    client = create_mqtt_client()
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect_async(
        settings.mqtt_broker,
        settings.mqtt_port,
        keepalive=60,
    )
    client.loop_start()
    _mqtt_client = client

    logger.info(
        "MQTT subscriber started for %s:%s",
        settings.mqtt_broker,
        settings.mqtt_port,
    )


def stop_mqtt_subscriber():
    global _mqtt_client

    if _mqtt_client is None:
        return

    client = _mqtt_client
    _mqtt_client = None

    client.disconnect()
    client.loop_stop()
    logger.info("MQTT subscriber stopped")
