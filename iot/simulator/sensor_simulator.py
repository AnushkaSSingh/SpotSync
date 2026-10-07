import json
import random
import time
from datetime import datetime, timezone


def generate_sensor_reading(sensor_id, slot_id):
    """
    Generate a simulated parking sensor reading.

    The sensor randomly reports whether a parking slot
    is occupied or available.
    """

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
    sensor_id = "SENSOR_001"
    slot_id = "LOT_A_001"

    print("SpotSync Sensor Simulator")
    print("--------------------------")
    print(f"Sensor ID: {sensor_id}")
    print(f"Slot ID:   {slot_id}")
    print("Press Ctrl+C to stop.\n")

    try:
        while True:
            reading = generate_sensor_reading(sensor_id, slot_id)

            print(json.dumps(reading, indent=2))

            time.sleep(5)

    except KeyboardInterrupt:
        print("\nSensor simulator stopped.")


if __name__ == "__main__":
    main()