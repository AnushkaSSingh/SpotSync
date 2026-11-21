
import ssl
import os
import re
import json
import time
import serial
import paho.mqtt.client as mqtt
from datetime import datetime, timezone


# ==========================================
# ARDUINO CONFIGURATION
# ==========================================

SERIAL_PORT = "COM4"
BAUD_RATE = 9600


# ==========================================
# PARKING SENSOR MAPPING
# ==========================================

SENSORS = {
    "SENSOR_001": "B1-A1",
    "SENSOR_002": "B1-A2",
    "SENSOR_003": "B1-A3",
    "SENSOR_004": "B2-A1",
    "SENSOR_005": "B2-A2",
    "SENSOR_006": "B2-A3",
    "SENSOR_007": "B2-A4",
}


# ==========================================
# INDIVIDUAL SENSOR THRESHOLDS (CM)
# ==========================================

SENSOR_THRESHOLDS = {
    "SENSOR_001": {"occupied": 12.0, "available": 20.0},
    "SENSOR_002": {"occupied": 12.0, "available": 20.0},
    "SENSOR_003": {"occupied": 12.0, "available": 20.0},
    "SENSOR_004": {"occupied": 12.0, "available": 20.0},
    "SENSOR_005": {"occupied": 12.0, "available": 20.0},
    "SENSOR_006": {"occupied": 4.0, "available": 7.0},
    "SENSOR_007": {"occupied": 12.0, "available": 20.0},
}


# Remember the last valid classification for each sensor.
last_status_by_sensor = {}


# ==========================================
# MQTT CONFIGURATION - EMQX CLOUD
# ==========================================

BROKER = os.getenv(
    "SPOTSYNC_MQTT_BROKER",
    "df78515f.ala.asia-southeast1.emqxsl.com"
)

PORT = int(os.getenv("SPOTSYNC_MQTT_PORT", "8883"))

MQTT_USERNAME = os.getenv("SPOTSYNC_MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("SPOTSYNC_MQTT_PASSWORD")

if not MQTT_USERNAME or not MQTT_PASSWORD:
    raise RuntimeError("MQTT username or password is missing.")


client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="spotsync_arduino_bridge",
    protocol=mqtt.MQTTv311
)

client.username_pw_set(
    MQTT_USERNAME,
    MQTT_PASSWORD
)

client.tls_set(
    cert_reqs=ssl.CERT_REQUIRED,
    tls_version=ssl.PROTOCOL_TLS_CLIENT
)


# ==========================================
# CONNECT TO MQTT
# ==========================================

client.connect(BROKER, PORT, 60)
client.loop_start()


# ==========================================
# CONNECT TO ARDUINO
# ==========================================

arduino = serial.Serial(
    SERIAL_PORT,
    BAUD_RATE,
    timeout=2
)

# Allow Arduino serial connection to stabilize.
time.sleep(2)

print("SpotSync Arduino MQTT Bridge Started")
print(f"Serial Port: {SERIAL_PORT}")
print(f"MQTT Broker: {BROKER}:{PORT}")
print("Monitoring 7 parking sensors...")


# ==========================================
# MAIN SENSOR READING LOOP
# ==========================================

try:
    while True:

        line = arduino.readline().decode(
            "utf-8",
            errors="ignore"
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


        # ==================================
        # HANDLE SENSOR FAULT
        # ==================================

        if reading == "NO ECHO":

            status = "fault"
            distance = -1.0


        # ==================================
        # PROCESS VALID DISTANCE
        # ==================================

        else:

            distance = float(reading)

            previous_status = last_status_by_sensor.get(
                sensor_id
            )

            thresholds = SENSOR_THRESHOLDS[sensor_id]


            # Clearly occupied.
            if distance <= thresholds["occupied"]:

                status = "occupied"


            # Clearly available.
            elif distance >= thresholds["available"]:

                status = "available"


            # Between thresholds: preserve previous state.
            elif previous_status is not None:

                status = previous_status


            # Initial reading: use midpoint.
            else:

                midpoint = (
                    thresholds["occupied"]
                    + thresholds["available"]
                ) / 2

                status = (
                    "occupied"
                    if distance < midpoint
                    else "available"
                )


            last_status_by_sensor[sensor_id] = status


        # ==================================
        # CREATE MQTT PAYLOAD
        # ==================================

        payload = {
            "sensor_id": sensor_id,
            "slot_id": slot_id,
            "status": status,
            "distance_cm": distance,
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat()
        }


        # ==================================
        # PUBLISH TO MQTT
        # ==================================

        topic = (
            f"spotsync/parking/{slot_id}/occupancy"
        )

        result = client.publish(
            topic,
            json.dumps(payload),
            qos=1
        )

        result.wait_for_publish()

        print("PUBLISHED:", topic)
        print(json.dumps(payload))


# ==========================================
# CLEAN SHUTDOWN
# ==========================================

except KeyboardInterrupt:

    print("\nBridge stopped.")


finally:

    arduino.close()

    client.loop_stop()
    client.disconnect()

    print("Arduino and MQTT connections closed.")
