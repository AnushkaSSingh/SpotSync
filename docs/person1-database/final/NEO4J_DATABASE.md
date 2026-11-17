# Neo4j Graph Database

## Local instance
- Name: spotsync-graph
- Version selected: 2026.10.2

## Schema constraints
File: database/neo4j/migrations/001_initial_graph_constraints.cypher

Unique constraints:
- Mall.pg_id
- Floor.pg_id
- ParkingSpace.pg_id
- Entrance.key
- Ramp.key
- Sensor.pg_id
- Sensor.sensor_code

## Seed data
File: database/neo4j/002_seed_demo_graph.cypher

The seed uses MERGE to support repeat execution without intentionally
creating duplicate nodes or relationships.

## Node labels
- Mall
- Floor
- ParkingSpace
- Entrance
- Ramp
- Sensor

## Relationships
- Mall HAS_FLOOR Floor
- Mall HAS_ENTRANCE Entrance
- Mall HAS_RAMP Ramp
- Entrance DEMO_CONNECTS_TO Ramp
- Ramp DEMO_CONNECTS_TO Floor
- Floor HAS_SPACE ParkingSpace
- Sensor MONITORS ParkingSpace
- Sensor LOCATED_AT Mall
- Sensor DETECTS_ENTRY_EXIT Entrance

## Canonical sensor mapping

Sensor identifiers must match PostgreSQL exactly.

SENSOR_001 through SENSOR_007:
- Role: PARKING_SPACE
- Type: ultrasonic
- Each sensor monitors its matching PostgreSQL parking slot:
  - SENSOR_001 -> slot 1 (B1-A1)
  - SENSOR_002 -> slot 2 (B1-A2)
  - SENSOR_003 -> slot 3 (B1-A3)
  - SENSOR_004 -> slot 4 (B1-A4)
  - SENSOR_005 -> slot 5 (B2-A1)
  - SENSOR_006 -> slot 6 (B2-A2)
  - SENSOR_007 -> slot 7 (B2-A3)

SENSOR_008:
- Role: ENTRANCE_EXIT
- Type: entrance_exit
- parking_slot_pg_id: absent
- Relationship: DETECTS_ENTRY_EXIT to ENTRANCE_MAIN
- Used for entrance/exit vehicle detection and counting.

The eighth legacy parking slot (B2-A4) is preserved in PostgreSQL
and represented in the graph as OUT_OF_SERVICE. It is not an
official operational parking space.

## Verification
File: database/neo4j/verify_graph.cypher

Expected graph summary:
- 1 Mall
- 2 Floors
- 8 ParkingSpace nodes
- 7 official operational spaces
- 8 Sensor nodes
- 7 MONITORS relationships
- 1 DETECTS_ENTRY_EXIT relationship

Detailed sensor mapping must show SENSOR_001 through SENSOR_007
connected to their matching spaces and SENSOR_008 connected to
the entrance without a parking-space assignment.

## Data ownership
PostgreSQL is the authoritative store for:
- Parking slots and their status
- Sensor records and their PostgreSQL IDs
- Sensor event history
- Parking sessions, bookings and ticket tokens

Neo4j stores the graph representation used for spatial relationships
and navigation queries. PostgreSQL IDs are retained as pg_id properties
to link graph entities to their relational records.

## Topology limitation
The entrance and ramp are demonstration placeholders. Their physical
positions, connections and floor routes must be confirmed against the
actual parking-site layout before production navigation is enabled.

## Rollback
File: database/neo4j/rollback.cypher

The rollback file removes the named uniqueness constraints only.
It does not delete seeded nodes or relationships.