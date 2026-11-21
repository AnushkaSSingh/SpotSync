import json
import os
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt


MQTT_BROKER = os.getenv("SPOTSYNC_MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("SPOTSYNC_MQTT_PORT", "1883"))
MQTT_TOPIC = "spotsync/parking/{slot_id}/occupancy"

SENSOR_SLOTS = {
    "SENSOR_001": "B1-A1",
    "SENSOR_002": "B1-A2",
    "SENSOR_003": "B1-A3",
    "SENSOR_004": "B2-A1",
    "SENSOR_005": "B2-A2",
    "SENSOR_006": "B2-A3",
    "SENSOR_007": "B2-A4",
}


def generate_sensor_reading(sensor_id, slot_id):
    occupied = random.choice([True, False])

    if occupied:
        distance_cm = round(random.uniform(3.0, 15.0), 2)
        status = "occupied"
    else:
        distance_cm = round(random.uniform(30.0, 100.0), 2)
        status = "available"

    return {
        "sensor_id": sensor_id,
        "slot_id": slot_id,
        "status": status,
        "distance_cm": distance_cm,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def main():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    print("SpotSync Eight-Sensor Simulator")
    print("--------------------------------")
    print(f"Simulating {len(SENSOR_SLOTS)} registered sensors.")
    print(f"MQTT: {MQTT_BROKER}:{MQTT_PORT}")
    print("Press Ctrl+C to stop.\n")

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()

        while True:
            for sensor_id, slot_id in SENSOR_SLOTS.items():
                reading = generate_sensor_reading(sensor_id, slot_id)
                topic = MQTT_TOPIC.format(slot_id=slot_id)
                payload = json.dumps(reading)

                info = client.publish(topic, payload, qos=1)
                info.wait_for_publish(timeout=5)

                if info.rc != mqtt.MQTT_ERR_SUCCESS:
                    print(f"Publish failed: {sensor_id} -> {slot_id}")
                else:
                    print(f"Published {sensor_id} -> {slot_id}: {reading['status']}")

                time.sleep(0.2)

            print("Completed one eight-sensor reading cycle.\n")
            time.sleep(5)

    except KeyboardInterrupt:
        print("\nSensor simulator stopped.")

    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
