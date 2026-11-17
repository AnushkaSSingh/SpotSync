SHOW CONSTRAINTS;
SHOW INDEXES;

// Sensor architecture check.
// Expected: seven parking-space sensors and one entrance/exit sensor.
MATCH (s:Sensor)
RETURN
    count(CASE WHEN s.role = 'PARKING_SPACE' THEN 1 END)
        AS parking_space_sensors,
    count(CASE WHEN s.role = 'ENTRANCE_EXIT' THEN 1 END)
        AS entrance_exit_sensors,
    count(s) AS total_sensors;

// Confirm that the entrance/exit sensor is not assigned to a parking slot.
MATCH (s:Sensor {sensor_code: 'SENSOR_008'})
RETURN s.sensor_code AS sensor,
       s.role AS role,
       s.parking_slot_pg_id AS parking_slot_pg_id;

// Check parking-space sensor mappings.
MATCH (s:Sensor {role: 'PARKING_SPACE'})
RETURN s.sensor_code, s.parking_slot_pg_id
ORDER BY s.sensor_code;

// Relationship inventory.
MATCH ()-[r]->()
RETURN type(r) AS relationship_type, count(r) AS total
ORDER BY relationship_type;