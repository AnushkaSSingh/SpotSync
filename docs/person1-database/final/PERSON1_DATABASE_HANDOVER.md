# SpotSync — Person 1 Database Handover

## Agreed sensor architecture

- S1-S7: seven official parking-space sensors.
- S8: entrance/exit vehicle detector and vehicle counter.
- S8 has no parking_slot_id.
- Legacy slot 8 (B2-A4) is preserved, marked OUT_OF_SERVICE,
  and is not an official operational parking space.

## Migration order

1. 20261117_120000_sessions_tokens_reservation_expiry.sql
2. 20261117_230000_sensor_roles_seven_plus_one.sql

The first migration adds booking expiry, parking sessions,
ticket tokens, constraints and supporting indexes.

The second migration corrects sensor roles and preserves
the legacy eighth slot.

## Safety

- Both migrations must be tested on the isolated restored database.
- The sensor migration aborts if S1-S7 are not mapped as expected.
- It aborts if slot 8 has pending or confirmed bookings.
- It does not delete sensor or parking-slot records.
- Do not apply to Render without explicit deployment approval.
- Do not run the rollback after the new architecture has begun
  creating real sessions or processing vehicle events.

## Verification

Run verify_person1.sql after both migrations.

Expected results:
- Seven parking sensors mapped to slots 1-7.
- One entrance_exit sensor with NULL parking_slot_id.
- Slot 8 retained as OUT_OF_SERVICE.
- parking_sessions and ticket_tokens exist.
- bookings.expires_at exists.

## Ownership

Person 1: PostgreSQL and database documentation.
Person 2: FastAPI services and routes.
Person 3: Staff frontend.
Person 4: Driver frontend.
Person 5: Simulator and integration tests.

Hardware integration is deferred.