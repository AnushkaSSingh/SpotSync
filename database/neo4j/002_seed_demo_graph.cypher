// SpotSync graph seed
// PostgreSQL source IDs preserved. Safe to rerun.

MERGE (m:Mall {pg_id: 1})
SET m.name = 'SpotSync Demo Parking',
    m.source = 'PostgreSQL parking_lots',
    m.source_pg_id = 1;

MERGE (f1:Floor {pg_id: 1})
SET f1.floor_code = 'B1',
    f1.floor_name = 'Basement Floor 1';

MERGE (f2:Floor {pg_id: 2})
SET f2.floor_code = 'B2',
    f2.floor_name = 'Basement Floor 2';

MATCH (m:Mall {pg_id: 1})
MATCH (f:Floor)
WHERE f.pg_id IN [1, 2]
MERGE (m)-[:HAS_FLOOR]->(f);

MERGE (e:Entrance {key: 'ENTRANCE_MAIN'})
SET e.name = 'Main Entrance',
    e.topology_status = 'DEMO_PLACEHOLDER';

MERGE (r:Ramp {key: 'RAMP_MAIN'})
SET r.name = 'Main Basement Ramp',
    r.topology_status = 'DEMO_PLACEHOLDER';

MATCH (m:Mall {pg_id: 1})
MATCH (e:Entrance {key: 'ENTRANCE_MAIN'})
MERGE (m)-[:HAS_ENTRANCE]->(e);

MATCH (m:Mall {pg_id: 1})
MATCH (r:Ramp {key: 'RAMP_MAIN'})
MERGE (m)-[:HAS_RAMP]->(r);

MATCH (e:Entrance {key: 'ENTRANCE_MAIN'})
MATCH (r:Ramp {key: 'RAMP_MAIN'})
MERGE (e)-[:DEMO_CONNECTS_TO]->(r);

MATCH (r:Ramp {key: 'RAMP_MAIN'})
MATCH (f:Floor)
WHERE f.pg_id IN [1, 2]
MERGE (r)-[:DEMO_CONNECTS_TO]->(f);

// Preserve all eight existing parking-space IDs.
UNWIND [
 {id:1, code:'B1-A1', floor:1, status:'UNKNOWN', official:true},
 {id:2, code:'B1-A2', floor:1, status:'UNKNOWN', official:true},
 {id:3, code:'B1-A3', floor:1, status:'UNKNOWN', official:true},
 {id:4, code:'B1-A4', floor:1, status:'UNKNOWN', official:true},
 {id:5, code:'B2-A1', floor:2, status:'UNKNOWN', official:true},
 {id:6, code:'B2-A2', floor:2, status:'UNKNOWN', official:true},
 {id:7, code:'B2-A3', floor:2, status:'UNKNOWN', official:true},
 {id:8, code:'B2-A4', floor:2, status:'OUT_OF_SERVICE', official:false}
] AS item
MATCH (f:Floor {pg_id: item.floor})
MERGE (s:ParkingSpace {pg_id: item.id})
SET s.display_code = item.code,
    s.status = item.status,
    s.official_operational_space = item.official,
    s.source = 'PostgreSQL parking_slots'
MERGE (f)-[:HAS_SPACE]->(s);

// S1-S7: one ultrasonic sensor per official parking space.
MATCH (m:Mall {pg_id: 1})
UNWIND range(1, 7) AS i
MATCH (s:ParkingSpace {pg_id: i})
MERGE (sen:Sensor {pg_id: i})
SET sen.sensor_code = 'SENSOR_' + right('00' + toString(i), 3),
    sen.role = 'PARKING_SPACE',
    sen.sensor_type = 'ultrasonic',
    sen.parking_slot_pg_id = i
MERGE (sen)-[:MONITORS]->(s)
MERGE (sen)-[:LOCATED_AT]->(m);

// S8: entrance/exit detector, not assigned to parking slot 8.
MATCH (e:Entrance {key: 'ENTRANCE_MAIN'})
MATCH (m:Mall {pg_id: 1})
MERGE (sen:Sensor {pg_id: 8})
SET sen.sensor_code = 'SENSOR_008',
    sen.role = 'ENTRANCE_EXIT',
    sen.sensor_type = 'entrance_exit'
REMOVE sen.parking_slot_pg_id
MERGE (sen)-[:DETECTS_ENTRY_EXIT]->(e)
MERGE (sen)-[:LOCATED_AT]->(m);