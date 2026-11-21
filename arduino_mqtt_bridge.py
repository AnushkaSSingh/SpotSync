
import os
import re
import json
import time
import serial
import paho.mqtt.client as mqtt
from datetime import datetime, timezone

SERIAL_PORT = "COM4"
BAUD_RATE = 9600

SENSORS = {
    "SENSOR_001": "B1-A1",
    "SENSOR_002": "B1-A2",
    "SENSOR_003": "B1-A3",
    "SENSOR_004": "B2-A1",
    "SENSOR_005": "B2-A2",
    "SENSOR_006": "B2-A3",
    "SENSOR_007": "B2-A4",
}

OCCUPIED_DISTANCE_CM = 15.0

BROKER = os.getenv("SPOTSYNC_MQTT_BROKER")
PORT = int(os.getenv("SPOTSYNC_MQTT_PORT", "1883"))

if not BROKER:
    raise RuntimeError("Set SPOTSYNC_MQTT_BROKER first.")

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="spotsync_arduino_bridge"
)
client.connect(BROKER, PORT, 60)
client.loop_start()

arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
time.sleep(2)

print("SpotSync Arduino MQTT Bridge Started")

try:
    while True:
        line = arduino.readline().decode(
            "utf-8", errors="ignore"
        ).strip()

        match = re.match(
            r"^(SENSOR_00[1-7])\s*:\s*(NO ECHO|[-+]?\d*\.?\d+)\s*(cm)?$",
            line,
            re.IGNORECASE
        )

        if not match:
            continue

        sensor_id = match.group(1).upper()
        reading = match.group(2).upper()
        slot_id = SENSORS[sensor_id]

        if reading == "NO ECHO":
            status = "fault"
            distance = -1.0
        else:
            distance = float(reading)
            status = (
                "occupied"
                if distance <= OCCUPIED_DISTANCE_CM
                else "available"
            )

        payload = {
            "sensor_id": sensor_id,
            "slot_id": slot_id,
            "status": status,
            "distance_cm": distance,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        topic = f"spotsync/parking/{slot_id}/occupancy"

        result = client.publish(topic, json.dumps(payload), qos=1)
        result.wait_for_publish()

        print("PUBLISHED:", topic)
        print(json.dumps(payload))

except KeyboardInterrupt:
    print("Bridge stopped.")

finally:
    arduino.close()
    client.loop_stop()
    client.disconnect()
