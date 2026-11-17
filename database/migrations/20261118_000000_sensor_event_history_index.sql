CREATE INDEX IF NOT EXISTS idx_sensor_events_sensor_created_at
ON public.sensor_events (sensor_id, created_at DESC);