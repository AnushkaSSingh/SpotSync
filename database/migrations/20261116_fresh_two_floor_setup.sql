BEGIN;

-- Floors
CREATE TABLE IF NOT EXISTS floors (
    id BIGSERIAL PRIMARY KEY,
    parking_lot_id BIGINT NOT NULL
        REFERENCES parking_lots(id) ON DELETE CASCADE,
    floor_code VARCHAR(10) NOT NULL,
    floor_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_floor_per_lot UNIQUE (parking_lot_id, floor_code)
);

-- Extend the existing parking slots table
ALTER TABLE parking_slots
    ADD COLUMN IF NOT EXISTS floor_id BIGINT,
    ADD COLUMN IF NOT EXISTS display_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_parking_slots_floor'
    ) THEN
        ALTER TABLE parking_slots
            ADD CONSTRAINT fk_parking_slots_floor
            FOREIGN KEY (floor_id) REFERENCES floors(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_parking_slot_status'
    ) THEN
        ALTER TABLE parking_slots
            ADD CONSTRAINT ck_parking_slot_status
            CHECK (status IN (
                'AVAILABLE', 'RESERVED', 'OCCUPIED',
                'OUT_OF_SERVICE', 'UNKNOWN'
            ));
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_parking_slot_display_code
    ON parking_slots (parking_lot_id, display_code)
    WHERE display_code IS NOT NULL;

-- Create a demo parking lot only if it does not exist
INSERT INTO parking_lots (name, address, total_slots, is_active)
SELECT 'SpotSync Demo Parking', 'Hackathon Demonstration Site', 8, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM parking_lots
    WHERE name = 'SpotSync Demo Parking'
);

-- Create the two floors
INSERT INTO floors (parking_lot_id, floor_code, floor_name)
SELECT id, 'B1', 'Basement Floor 1'
FROM parking_lots
WHERE name = 'SpotSync Demo Parking'
ON CONFLICT (parking_lot_id, floor_code) DO NOTHING;

INSERT INTO floors (parking_lot_id, floor_code, floor_name)
SELECT id, 'B2', 'Basement Floor 2'
FROM parking_lots
WHERE name = 'SpotSync Demo Parking'
ON CONFLICT (parking_lot_id, floor_code) DO NOTHING;

-- Create exactly eight physical parking spaces
INSERT INTO parking_slots (
    parking_lot_id, slot_number, slot_type,
    is_available, floor_id, display_code, status
)
SELECT
    lot.id,
    mapping.display_code,
    'regular',
    FALSE,
    f.id,
    mapping.display_code,
    'UNKNOWN'
FROM parking_lots lot
JOIN (
    VALUES
        ('B1', 'B1-A1'), ('B1', 'B1-A2'),
        ('B1', 'B1-A3'), ('B1', 'B1-A4'),
        ('B2', 'B2-A1'), ('B2', 'B2-A2'),
        ('B2', 'B2-A3'), ('B2', 'B2-A4')
) AS mapping(floor_code, display_code) ON TRUE
JOIN floors f
    ON f.parking_lot_id = lot.id
   AND f.floor_code = mapping.floor_code
WHERE lot.name = 'SpotSync Demo Parking'
ON CONFLICT (parking_lot_id, slot_number) DO NOTHING;

-- Keep the lot's total slot count accurate
UPDATE parking_lots
SET total_slots = (
    SELECT COUNT(*)
    FROM parking_slots
    WHERE parking_slots.parking_lot_id = parking_lots.id
)
WHERE name = 'SpotSync Demo Parking';

-- Sensors
CREATE TABLE IF NOT EXISTS sensors (
    id BIGSERIAL PRIMARY KEY,
    parking_lot_id BIGINT NOT NULL
        REFERENCES parking_lots(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen_at TIMESTAMPTZ,
    sensor_code VARCHAR(30),
    parking_slot_id BIGINT REFERENCES parking_slots(id)
);

ALTER TABLE sensors
    ADD COLUMN IF NOT EXISTS sensor_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS parking_slot_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_sensor_parking_slot'
    ) THEN
        ALTER TABLE sensors
            ADD CONSTRAINT fk_sensor_parking_slot
            FOREIGN KEY (parking_slot_id) REFERENCES parking_slots(id);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_sensors_sensor_code
    ON sensors (sensor_code)
    WHERE sensor_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_sensors_parking_slot
    ON sensors (parking_slot_id)
    WHERE parking_slot_id IS NOT NULL;

-- Sensor event history
CREATE TABLE IF NOT EXISTS sensor_events (
    id BIGSERIAL PRIMARY KEY,
    sensor_id BIGINT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL
);

-- Sensor and parking incidents
CREATE TABLE IF NOT EXISTS incidents (
    id BIGSERIAL PRIMARY KEY,
    parking_lot_id BIGINT NOT NULL
        REFERENCES parking_lots(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    description TEXT NOT NULL
);

-- Create the eight sensor-to-slot mappings
INSERT INTO sensors (
    parking_lot_id, sensor_type, is_online,
    sensor_code, parking_slot_id
)
SELECT
    lot.id,
    'ultrasonic',
    FALSE,
    mapping.sensor_code,
    ps.id
FROM parking_lots lot
JOIN (
    VALUES
        ('SENSOR_001', 'B1-A1'),
        ('SENSOR_002', 'B1-A2'),
        ('SENSOR_003', 'B1-A3'),
        ('SENSOR_004', 'B1-A4'),
        ('SENSOR_005', 'B2-A1'),
        ('SENSOR_006', 'B2-A2'),
        ('SENSOR_007', 'B2-A3'),
        ('SENSOR_008', 'B2-A4')
) AS mapping(sensor_code, display_code) ON TRUE
JOIN parking_slots ps
    ON ps.parking_lot_id = lot.id
   AND ps.display_code = mapping.display_code
WHERE lot.name = 'SpotSync Demo Parking'
ON CONFLICT DO NOTHING;

COMMIT;
