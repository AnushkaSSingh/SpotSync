# PostgreSQL and Neo4j Synchronization

## Purpose
This document defines the data ownership and synchronization contract
between SpotSync PostgreSQL and Neo4j.

## Source of truth
PostgreSQL is authoritative for parking slots, sensors, sensor events,
bookings, parking sessions and ticket tokens.

Neo4j stores a graph representation of mall topology, floors, parking
spaces, entrances, ramps and their relationships.

Graph nodes retain PostgreSQL primary keys in their pg_id properties
where applicable.

## Initial graph creation
The initial graph is created using:
- database/neo4j/migrations/001_initial_graph_constraints.cypher
- database/neo4j/002_seed_demo_graph.cypher

The seed uses MERGE and should be safe to rerun for the same source IDs.

## Synchronization contract
Any future synchronization implementation must:
1. Read authoritative entity IDs and attributes from PostgreSQL.
2. Upsert corresponding Neo4j nodes using stable PostgreSQL IDs.
3. Upsert relationships using stable endpoint IDs.
4. Preserve the canonical sensor IDs SENSOR_001 through SENSOR_008.
5. Never create a parking-space assignment for SENSOR_008.
6. Represent the legacy B2-A4 slot as OUT_OF_SERVICE.
7. Avoid overwriting newer graph data with stale events.
8. Log failures and support retrying incomplete synchronization.
9. Define how deleted or deactivated PostgreSQL records are handled.
10. Verify node and relationship counts after synchronization.

## Current implementation status
The initial local graph schema and seed have been applied and verified.
An ongoing automatic PostgreSQL-to-Neo4j synchronization service has
not been confirmed as implemented. The seed script is not a substitute
for continuous synchronization.

## Ownership
Person 1 owns the database structure, graph schema, seed and this
synchronization contract.

Person 2 owns backend service/API implementation that may coordinate
runtime synchronization, subject to the agreed database contract.

Person 5 owns integration testing of the complete data flow using
simulated sensor events.

## Topology limitation
Entrance and ramp relationships currently use demonstration placeholders.
Production navigation requires verified physical layout and route data.