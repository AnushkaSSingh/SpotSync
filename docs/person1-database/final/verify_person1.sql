SELECT sensor_code, sensor_type, parking_slot_id
FROM sensors
ORDER BY sensor_code;

SELECT id, display_code, status, is_available
FROM parking_slots
ORDER BY id;

SELECT
    (SELECT COUNT(*) FROM sensors
     WHERE sensor_code IN (
       'SENSOR_001','SENSOR_002','SENSOR_003','SENSOR_004',
       'SENSOR_005','SENSOR_006','SENSOR_007'
     ) AND parking_slot_id IS NOT NULL) AS seven_space_sensors,

    (SELECT COUNT(*) FROM sensors
     WHERE sensor_code = 'SENSOR_008'
       AND sensor_type = 'entrance_exit'
       AND parking_slot_id IS NULL) AS entrance_exit_sensors,

    (SELECT COUNT(*) FROM parking_slots
     WHERE id = 8
       AND display_code = 'B2-A4'
       AND status = 'OUT_OF_SERVICE'
       AND is_available = FALSE) AS preserved_legacy_slots;

SELECT to_regclass('public.parking_sessions') AS parking_sessions,
       to_regclass('public.ticket_tokens') AS ticket_tokens;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
  AND column_name = 'expires_at';