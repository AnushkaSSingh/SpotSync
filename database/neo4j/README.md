# SpotSync Neo4j Database

## Responsibility
Person 1 owns the Neo4j graph schema, constraints, seed data,
verification queries and database documentation.

PostgreSQL remains the authoritative transactional database.
Neo4j represents parking topology and relationships for graph queries.

## Graph structure
- Mall: SpotSync Demo Parking (PostgreSQL lot ID 1)
- Floors: B1 and B2 (PostgreSQL IDs 1 and 2)
- Entrance: main entrance demo placeholder
- Ramp: main basement ramp demo placeholder
- ParkingSpace: PostgreSQL slot IDs 1 through 8
- Sensor: PostgreSQL sensor IDs 1 through 8

## Parking spaces
B1: B1-A1, B1-A2, B1-A3, B1-A4
B2: B2-A1, B2-A2, B2-A3
B2-A4 is preserved as OUT_OF_SERVICE and is not an official space.

## Sensor mapping
SENSOR_001 through SENSOR_007 have role PARKING_SPACE
and monitor PostgreSQL parking slots 1 through 7.

SENSOR_008 has role ENTRANCE_EXIT. It detects entry/exit
and is not connected to parking slot 8.

## Relationships
- Mall - HAS_FLOOR -> Floor
- Mall - HAS_ENTRANCE -> Entrance
- Mall - HAS_RAMP -> Ramp
- Floor - HAS_SPACE -> ParkingSpace
- Sensor - MONITORS -> ParkingSpace
- Sensor - LOCATED_AT -> Mall
- Sensor S8 - DETECTS_ENTRY_EXIT -> Entrance
- Entrance and Ramp and floors have provisional demo topology links.

## Files and execution order
1. migrations/001_initial_graph_constraints.cypher
2. 002_seed_demo_graph.cypher
3. verify_graph.cypher

Use rollback.cypher only when intentionally removing the
constraints created by this package.

The seed uses MERGE so it can be rerun without duplicating
nodes or relationships.

## Important
The Entrance and Ramp positions and topology are placeholders.
Confirm the actual physical layout before using graph paths
for real navigation.

The seed contains demo topology, not a PostgreSQL-to-Neo4j
synchronization service. A synchronization strategy is needed
before production use.