-- SpotSync Seed Data
-- Owner: Vanshika
-- Development/test data only

-- ============================================================
-- TEST USERS
-- ============================================================

INSERT INTO users (
    name,
    email,
    phone,
    password_hash,
    role
)
VALUES
(
    'Test User',
    'testuser@spotsync.local',
    '9000000001',
    'TEST_HASH_REPLACE_LATER',
    'user'
),
(
    'Test Admin',
    'admin@spotsync.local',
    '9000000002',
    'TEST_HASH_REPLACE_LATER',
    'admin'
)
ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- TEST VEHICLES
-- ============================================================

INSERT INTO vehicles (
    user_id,
    vehicle_number,
    vehicle_type
)
SELECT
    id,
    'UP32AB1234',
    'car'
FROM users
WHERE email = 'testuser@spotsync.local'
ON CONFLICT (vehicle_number) DO NOTHING;


-- ============================================================
-- TEST PARKING LOT
-- ============================================================

INSERT INTO parking_lots (
    name,
    address,
    latitude,
    longitude,
    total_slots
)
VALUES (
    'SpotSync Demo Parking',
    'Lucknow, Uttar Pradesh',
    26.8467,
    80.9462,
    10
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- TEST PARKING SLOTS
-- ============================================================

INSERT INTO parking_slots (
    parking_lot_id,
    slot_number,
    slot_type
)
SELECT
    id,
    slot_number,
    'regular'
FROM parking_lots
CROSS JOIN (
    VALUES
        ('A1'),
        ('A2'),
        ('A3'),
        ('A4'),
        ('A5'),
        ('B1'),
        ('B2'),
        ('B3'),
        ('B4'),
        ('B5')
) AS slots(slot_number)
WHERE parking_lots.name = 'SpotSync Demo Parking'
ON CONFLICT (parking_lot_id, slot_number) DO NOTHING;