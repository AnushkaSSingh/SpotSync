BEGIN;

DO $$
DECLARE
    sensor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sensor_count
    FROM sensors
    WHERE sensor_code IN (
        'SENSOR_001','SENSOR_002','SENSOR_003','SENSOR_004',
        'SENSOR_005','SENSOR_006','SENSOR_007'
    );

    IF sensor_count <> 7 THEN
        RAISE EXCEPTION
            'Expected seven official parking sensors; found %', sensor_count;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM generate_series(1, 7) AS n
        LEFT JOIN sensors s
          ON s.sensor_code = 'SENSOR_' || LPAD(n::text, 3, '0')
        WHERE s.id IS NULL OR s.parking_slot_id <> n
    ) THEN
        RAISE EXCEPTION
            'S1-S7 mapping differs from the agreed seven-space architecture';
    END IF;

    IF (SELECT COUNT(*) FROM sensors
        WHERE sensor_code = 'SENSOR_008') <> 1 THEN
        RAISE EXCEPTION 'Expected exactly one SENSOR_008 record';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM parking_slots
        WHERE id = 8 AND display_code = 'B2-A4'
    ) THEN
        RAISE EXCEPTION
            'Expected legacy parking slot 8 (B2-A4) was not found';
    END IF;

    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE parking_slot_id = 8
          AND status IN ('pending', 'confirmed')
    ) THEN
        RAISE EXCEPTION
            'Slot 8 has active bookings. Resolve them before retiring the slot.';
    END IF;
END $$;

-- S8 is the entrance/exit detector, not a parking-space sensor.
UPDATE sensors
SET sensor_type = 'entrance_exit',
    parking_slot_id = NULL
WHERE sensor_code = 'SENSOR_008';

-- Preserve the legacy eighth slot and its ID, but exclude it from operations.
UPDATE parking_slots
SET status = 'OUT_OF_SERVICE',
    is_available = FALSE
WHERE id = 8
  AND display_code = 'B2-A4';

COMMIT;