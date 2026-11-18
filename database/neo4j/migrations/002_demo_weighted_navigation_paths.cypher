// SpotSync simulated navigation topology
// Idempotent demo migration. Not actual parking-lot measurements.

MATCH (e:Entrance {key: 'ENTRANCE_MAIN'}),
      (r:Ramp {key: 'RAMP_MAIN'}),
      (f1:Floor {pg_id: 1}),
      (f2:Floor {pg_id: 2})
SET e.nav_key = 'ENTRANCE_MAIN',
    r.nav_key = 'RAMP_MAIN',
    f1.nav_key = 'FLOOR_B1',
    f2.nav_key = 'FLOOR_B2'
WITH e, r, f1, f2
MATCH (p:ParkingSpace)
WHERE p.pg_id IN range(1, 7)
  AND p.official_operational_space = true
SET p.nav_key = 'PARKING_SPACE_' + toString(p.pg_id)
RETURN count(p) AS configured_spaces;

// Create weighted directed paths.
UNWIND [
    {from: 'ENTRANCE_MAIN', to: 'RAMP_MAIN', distance: 4.0, time: 5},
    {from: 'RAMP_MAIN', to: 'FLOOR_B1', distance: 6.0, time: 8},
    {from: 'RAMP_MAIN', to: 'FLOOR_B2', distance: 12.0, time: 16},
    {from: 'FLOOR_B1', to: 'PARKING_SPACE_1', distance: 3.0, time: 4},
    {from: 'FLOOR_B1', to: 'PARKING_SPACE_2', distance: 5.0, time: 7},
    {from: 'FLOOR_B1', to: 'PARKING_SPACE_3', distance: 7.0, time: 9},
    {from: 'FLOOR_B1', to: 'PARKING_SPACE_4', distance: 9.0, time: 12},
    {from: 'FLOOR_B2', to: 'PARKING_SPACE_5', distance: 4.0, time: 5},
    {from: 'FLOOR_B2', to: 'PARKING_SPACE_6', distance: 6.0, time: 8},
    {from: 'FLOOR_B2', to: 'PARKING_SPACE_7', distance: 8.0, time: 11}
] AS edge
MATCH (a {nav_key: edge.from})
MATCH (b {nav_key: edge.to})
MERGE (a)-[path:PATH {model: 'SIMULATED_DEMO_V1'}]->(b)
SET path.distance_m = edge.distance,
    path.travel_time_s = edge.time,
    path.accessible = true,
    path.source = 'SIMULATED_DEMO',
    path.topology_status = 'UNVERIFIED_PLACEHOLDER'
RETURN count(path) AS configured_path_edges;
