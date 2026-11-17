# SpotSync — Person 1 Database Handover

## Responsibility
Person 1 owns PostgreSQL and Neo4j database structure, migrations,
relationships, configuration, seed data, verification and documentation.

## Current implementation status

### PostgreSQL
- Local isolated test database: spotsync_person1_fresh_test
- Baseline migration:
  database/migrations/20261117_120000_sessions_tokens_reservation_expiry.sql
- Sensor role migration:
  database/migrations/20261117_230000_sensor_roles_seven_plus_one.sql
- Both migrations applied and verified on the local test database.
- Existing eight parking-slot records and eight sensor records preserved.
- Existing floor records preserved.
- parking_sessions and ticket_tokens tables created.
- bookings.expires_at added.
- Supporting indexes and constraints created.

### Neo4j
- Local DBMS: spotsync-graph
- Neo4j version selected: 2026.10.2
- Constraints created from:
  database/neo4j/migrations/001_initial_graph_constraints.cypher
- Demo graph seeded from:
  database/neo4j/002_seed_demo_graph.cypher
- Verification script:
  database/neo4j/verify_graph.cypher
- Expected graph counts confirmed by the user.

## Parking and sensor architecture

- S1–S7: one ultrasonic parking-space sensor per official space.
- S8: entrance/exit vehicle detector.
- S8 has no parking_slot_pg_id assignment.
- S8 supports entrance/exit detection and vehicle counting logic.
- Parking spaces 1–7 are the seven official operational spaces.
- Legacy slot 8 (B2-A4) is preserved and marked OUT_OF_SERVICE.
- No physical hardware is installed yet; software-first development uses simulated sensor data.

## PostgreSQL to Neo4j mapping

- PostgreSQL parking_lots -> Neo4j Mall
- PostgreSQL floors -> Neo4j Floor
- PostgreSQL parking_slots -> Neo4j ParkingSpace
- PostgreSQL sensors -> Neo4j Sensor
- Mall HAS_FLOOR Floor
- Floor HAS_SPACE ParkingSpace
- Sensor MONITORS ParkingSpace
- Sensor DETECTS_ENTRY_EXIT Entrance

Entrance and ramp positions are demo placeholders. Confirm actual physical topology before using them for navigation.

## Environment and deployment

- Local PostgreSQL test database: verified.
- Local Neo4j database: verified by expected summary counts.
- Render PostgreSQL database: NOT modified.
- No production migration or deployment has been performed as part of this work.
- Keep database credentials in local environment variables or secret settings.
- Never commit .env files, passwords, or connection strings containing credentials.

## Ownership boundaries

Person 1: database schemas, migrations, graph structure, seed data and database documentation.

Person 2: FastAPI routes, services and business logic.

Person 3: staff frontend.

Person 4: driver frontend.

Person 5: simulator, integration and testing.

Database work does not imply that API routes, frontend features or hardware integration are complete.