// 1. Mall
MATCH (m:Mall)
RETURN 'Mall count' AS check_name, count(m) AS actual, 1 AS expected;

// 2. Floors
MATCH (f:Floor)
RETURN 'Floor count' AS check_name, count(f) AS actual, 2 AS expected;

// 3. Parking spaces
MATCH (s:ParkingSpace)
RETURN 'Parking space count' AS check_name, count(s) AS actual, 8 AS expected;

// 4. Official operational spaces
MATCH (s:ParkingSpace {official_operational_space: true})
RETURN 'Official spaces' AS check_name, count(s) AS actual, 7 AS expected;

// 5. Sensors
MATCH (sen:Sensor)
RETURN 'Sensor count' AS check_name, count(sen) AS actual, 8 AS expected;

// 6. S1-S7 sensor-to-space mapping
MATCH (sen:Sensor)-[:MONITORS]->(s:ParkingSpace)
RETURN sen.sensor_code AS sensor,
       sen.role AS role,
       s.display_code AS parking_space,
       s.pg_id AS postgres_slot_id
ORDER BY s.pg_id;

// 7. S8 entrance/exit mapping
MATCH (sen:Sensor {sensor_code: 'S8'})-[:DETECTS_ENTRY_EXIT]->(e:Entrance)
RETURN sen.sensor_code AS sensor,
       sen.role AS role,
       sen.sensor_type AS sensor_type,
       e.name AS detected_at,
       sen.parking_slot_pg_id AS parking_slot_assignment;

// 8. Confirm slot 8 is out of service
MATCH (s:ParkingSpace {pg_id: 8})
RETURN s.display_code AS space,
       s.status AS status,
       s.official_operational_space AS operational;

// 9. Relationship totals
MATCH ()-[r]->()
RETURN type(r) AS relationship, count(r) AS total
ORDER BY relationship;

// 10. Node totals
MATCH (n)
UNWIND labels(n) AS node_label
RETURN node_label, count(*) AS total
ORDER BY node_label;

// 11. Constraints
SHOW CONSTRAINTS;