BEGIN;

LOCK TABLE public.parking_slots, public.sensors, public.parking_lots
IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
    slot_count INTEGER;
    sensor_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO slot_count
    FROM public.parking_slots
    WHERE parking_lot_id = 1
      AND slot_number IN (
        'B1-A1', 'B1-A2', 'B1-A3',
        'B2-A1', 'B2-A2', 'B2-A3', 'B2-A4'
      );

    IF slot_count <> 7 THEN
        RAISE EXCEPTION 'Expected seven official parking spaces; found %', slot_count;
    END IF;

    SELECT COUNT(*) INTO sensor_count
    FROM public.sensors s
    JOIN public.parking_slots p ON p.id = s.parking_slot_id
    WHERE s.sensor_code IN (
        'SENSOR_001', 'SENSOR_002', 'SENSOR_003',
        'SENSOR_004', 'SENSOR_005', 'SENSOR_006', 'SENSOR_007'
    )
    AND (
        (s.sensor_code = 'SENSOR_001' AND p.slot_number = 'B1-A1')
        OR (s.sensor_code = 'SENSOR_002' AND p.slot_number = 'B1-A2')
        OR (s.sensor_code = 'SENSOR_003' AND p.slot_number = 'B1-A3')
        OR (s.sensor_code = 'SENSOR_004' AND p.slot_number = 'B2-A1')
        OR (s.sensor_code = 'SENSOR_005' AND p.slot_number = 'B2-A2')
        OR (s.sensor_code = 'SENSOR_006' AND p.slot_number = 'B2-A3')
        OR (s.sensor_code = 'SENSOR_007' AND p.slot_number = 'B2-A4')
    );

    IF sensor_count <> 7 THEN
        RAISE EXCEPTION 'Seven-sensor parking mapping verification failed';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.sensors
        WHERE sensor_code = 'SENSOR_008'
          AND parking_slot_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'SENSOR_008 must remain unassigned to a parking slot';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.parking_slots
        WHERE slot_number = 'B1-A4'
    ) THEN
        RAISE EXCEPTION 'Obsolete B1-A4 must not be recreated';
    END IF;
END $$;

-- Enable every official parking space currently marked out of service.
-- Preserve occupied, reserved, and other existing states.
UPDATE public.parking_slots
SET status = 'AVAILABLE',
    is_available = TRUE
WHERE parking_lot_id = 1
  AND slot_number IN (
    'B1-A1', 'B1-A2', 'B1-A3',
    'B2-A1', 'B2-A2', 'B2-A3', 'B2-A4'
  )
  AND status = 'OUT_OF_SERVICE';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.parking_slots
        WHERE parking_lot_id = 1
          AND slot_number IN (
            'B1-A1', 'B1-A2', 'B1-A3',
            'B2-A1', 'B2-A2', 'B2-A3', 'B2-A4'
          )
          AND status = 'OUT_OF_SERVICE'
    ) THEN
        RAISE EXCEPTION 'An official parking space is still out of service';
    END IF;
END $$;

COMMIT;
