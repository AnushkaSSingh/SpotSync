BEGIN;

LOCK TABLE public.bookings, public.sensors,
           public.parking_slots, public.parking_lots
IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
    slot_count integer;
    booking_count integer;
    sensor_count integer;
BEGIN
    SELECT COUNT(*) INTO slot_count
    FROM public.parking_slots
    WHERE parking_lot_id = 1;

    IF slot_count <> 8 THEN
        RAISE EXCEPTION 'Expected 8 slots; found %', slot_count;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.parking_lots
        WHERE id = 1 AND total_slots = 8
    ) THEN
        RAISE EXCEPTION 'Parking lot state does not match audit';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.parking_slots
        WHERE id = 4 AND parking_lot_id = 1
          AND slot_number = 'B1-A4'
    ) THEN
        RAISE EXCEPTION 'Expected legacy slot B1-A4 at ID 4';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.parking_slots
        WHERE id = 8 AND parking_lot_id = 1
          AND slot_number = 'B2-A4'
          AND status = 'OUT_OF_SERVICE'
    ) THEN
        RAISE EXCEPTION 'B2-A4 does not match audited state';
    END IF;

    SELECT COUNT(*) INTO sensor_count
    FROM public.sensors
    WHERE (sensor_code = 'SENSOR_004' AND parking_slot_id = 4)
       OR (sensor_code = 'SENSOR_005' AND parking_slot_id = 5)
       OR (sensor_code = 'SENSOR_006' AND parking_slot_id = 6)
       OR (sensor_code = 'SENSOR_007' AND parking_slot_id = 7)
       OR (sensor_code = 'SENSOR_008' AND parking_slot_id IS NULL);

    IF sensor_count <> 5 THEN
        RAISE EXCEPTION 'Sensor assignments differ from audited state';
    END IF;

    SELECT COUNT(*) INTO booking_count
    FROM public.bookings
    WHERE parking_slot_id = 4;

    IF booking_count <> 0 THEN
        RAISE EXCEPTION 'B1-A4 has booking references; refusing deletion';
    END IF;
END $$;

-- Clear mappings first to avoid the unique sensor-per-slot index
-- blocking the reassignment.
UPDATE public.sensors
SET parking_slot_id = NULL
WHERE sensor_code IN (
    'SENSOR_004', 'SENSOR_005',
    'SENSOR_006', 'SENSOR_007'
);

-- Apply the official seven-space sensor mapping.
UPDATE public.sensors
SET parking_slot_id = CASE sensor_code
    WHEN 'SENSOR_004' THEN 5
    WHEN 'SENSOR_005' THEN 6
    WHEN 'SENSOR_006' THEN 7
    WHEN 'SENSOR_007' THEN 8
END
WHERE sensor_code IN (
    'SENSOR_004', 'SENSOR_005',
    'SENSOR_006', 'SENSOR_007'
);

-- Retire the obsolete eighth parking space.
DELETE FROM public.parking_slots
WHERE id = 4
  AND parking_lot_id = 1
  AND slot_number = 'B1-A4';

-- Update the official parking-space count.
UPDATE public.parking_lots
SET total_slots = 7
WHERE id = 1;

-- Verify the final state before committing.
DO $$
DECLARE
    slot_count integer;
    sensor_count integer;
BEGIN
    SELECT COUNT(*) INTO slot_count
    FROM public.parking_slots
    WHERE parking_lot_id = 1;

    IF slot_count <> 7 THEN
        RAISE EXCEPTION 'Final slot count is %, expected 7', slot_count;
    END IF;

    SELECT COUNT(*) INTO sensor_count
    FROM public.sensors
    WHERE (sensor_code = 'SENSOR_001' AND parking_slot_id = 1)
       OR (sensor_code = 'SENSOR_002' AND parking_slot_id = 2)
       OR (sensor_code = 'SENSOR_003' AND parking_slot_id = 3)
       OR (sensor_code = 'SENSOR_004' AND parking_slot_id = 5)
       OR (sensor_code = 'SENSOR_005' AND parking_slot_id = 6)
       OR (sensor_code = 'SENSOR_006' AND parking_slot_id = 7)
       OR (sensor_code = 'SENSOR_007' AND parking_slot_id = 8)
       OR (sensor_code = 'SENSOR_008' AND parking_slot_id IS NULL);

    IF sensor_count <> 8 THEN
        RAISE EXCEPTION 'Final sensor mapping verification failed';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.parking_slots
        WHERE id = 4 OR slot_number = 'B1-A4'
    ) THEN
        RAISE EXCEPTION 'Legacy B1-A4 still exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.parking_slots
        WHERE id = 8 AND status = 'OUT_OF_SERVICE'
    ) THEN
        RAISE EXCEPTION 'B2-A4 status unexpectedly changed';
    END IF;
END $$;

COMMIT;

-- Display the committed result.
SELECT id, slot_number, display_code, floor_id, status, is_available
FROM public.parking_slots
WHERE parking_lot_id = 1
ORDER BY id;

SELECT id, sensor_code, parking_slot_id
FROM public.sensors
ORDER BY id;

SELECT id, total_slots
FROM public.parking_lots
WHERE id = 1;
