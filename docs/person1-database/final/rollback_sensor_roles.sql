BEGIN;

UPDATE sensors
SET sensor_type = 'ultrasonic',
    parking_slot_id = 8
WHERE sensor_code = 'SENSOR_008';

UPDATE parking_slots
SET status = 'UNKNOWN',
    is_available = FALSE
WHERE id = 8
  AND display_code = 'B2-A4';

COMMIT;