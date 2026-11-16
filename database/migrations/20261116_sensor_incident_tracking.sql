ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS sensor_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_incidents_sensor_id'
    ) THEN
        ALTER TABLE incidents
        ADD CONSTRAINT fk_incidents_sensor_id
        FOREIGN KEY (sensor_id)
        REFERENCES sensors(id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_incidents_sensor_id
ON incidents(sensor_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_incidents_open_sensor_type
ON incidents(sensor_id, incident_type)
WHERE status = 'open' AND sensor_id IS NOT NULL;
