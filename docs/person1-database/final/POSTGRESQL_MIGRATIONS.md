# PostgreSQL Migration Record

## Migration 1
File:
database/migrations/20261117_120000_sessions_tokens_reservation_expiry.sql

Changes:
- Adds bookings.expires_at as TIMESTAMPTZ.
- Adds a partial index for pending booking expiry.
- Adds composite uniqueness support for parking-slot lot relationships.
- Creates parking_sessions.
- Creates ticket_tokens.
- Adds supporting indexes.
- Adds an updated_at trigger for parking_sessions.

## Migration 2
File:
database/migrations/20261117_230000_sensor_roles_seven_plus_one.sql

Changes:
- Preserves the eight existing sensor records.
- Configures S1–S7 as ultrasonic parking-space sensors.
- Maps S1–S7 to parking slots 1–7.
- Configures S8 as entrance_exit.
- Leaves S8 parking_slot_id NULL.
- Preserves parking slot 8 and marks it OUT_OF_SERVICE.
- Keeps the seven official spaces separate from the legacy eighth slot.

## Verification
The migrations were applied to the isolated local test database:
spotsync_person1_fresh_test

Verification confirmed:
- Eight parking slots.
- Eight sensor records.
- Seven parking-space sensors.
- One entrance/exit sensor.
- One preserved legacy out-of-service slot.
- parking_sessions and ticket_tokens exist.
- bookings.expires_at is timestamp with time zone.

## Safety
The Render database was not modified.

Before applying either migration to another database:
1. Take a fresh backup.
2. Confirm the target database and environment.
3. Check whether the migration has already been applied.
4. Apply migrations in order.
5. Run the verification SQL.
6. Retain the backup until verification succeeds.

Do not blindly rerun migrations on a database that may already contain their changes.