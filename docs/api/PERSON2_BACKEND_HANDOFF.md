# SpotSync — Person 2 Backend Handover

## 1. Responsibilities
Person 2 owns FastAPI routes, schemas, services, validation, business logic, sensor processing, and WebSocket publishing.

## 2. API documentation
- Swagger: /docs
- OpenAPI: /openapi.json
- ReDoc: /redoc

## 3. Authentication
Protected API routes require a Bearer access token.
HTTP sensor ingestion requires the configured X-Sensor-Token header.

## 4. Main API endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/parking/overview
- GET /api/parking/slots
- GET /api/parking/availability
- PATCH /api/parking/slots/{slot_id}
- GET /api/bookings
- POST /api/bookings
- POST /api/bookings/auto
- PATCH /api/bookings/{booking_id}/cancel
- POST /api/sessions/entry
- POST /api/sessions/{session_id}/exit
- GET /api/sessions
- POST /api/tickets/sessions/{session_id}
- POST /api/tickets/validate
- POST /api/payments/create-order
- POST /api/payments/verify
- POST /api/payments/refund
- GET /api/notifications
- POST /api/sensors/events

## 5. Sensor payload contract
Parking sensor MQTT topic: spotsync/parking/{slot_id}/occupancy

Required payload fields:
- sensor_id: registered Sensor.sensor_code string
- slot_id: assigned slot number or display code
- status: supported parking sensor status
- timestamp: timezone-aware ISO 8601 timestamp

Supported parking statuses include occupied, available, fault, blocked, sensor_offline, and unexpected_occupancy.

Entrance/exit sensor SENSOR_008 must be registered as entrance_exit with no parking slot. Its events use entry_detected, exit_detected, fault, or sensor_offline and omit slot_id.

## 6. WebSocket
Parking live updates: /ws/parking
Parking sensor state changes, stale sensor changes, and admin slot updates publish dashboard events.

## 7. MQTT integration
The backend subscriber listens on spotsync/parking/+/occupancy and the proposed entrance-event topic spotsync/sensors/+/events (including SENSOR_008).
Person 5 must confirm and implement this entrance-event topic and the agreed JSON payload before end-to-end integration is considered complete.
The current sensor bridge publishes a different topic and payload shape. Confirm the simulator contract with Person 5 before changing the bridge.
The current subscriber does not apply the HTTP X-Sensor-Token authentication mechanism.

## 8. Configuration
Set MQTT_ENABLED=true and configure MQTT_BROKER and MQTT_PORT in the local environment when testing MQTT.
Set a real SENSOR_INGESTION_TOKEN for HTTP sensor ingestion. Do not use the example placeholder as a production secret.

## 9. Tests
Run the full backend suite with:
python -m pytest -q

Latest verified full-suite result: 157 passed, 4 warnings.
MQTT subscriber tests:
python -m pytest -q tests/mqtt/test_subscriber.py

Latest verified MQTT result: 5 passed.

## 10. Integration handover
Person 2: FastAPI routes, schemas, services, validation, business logic, sensor processing and WebSocket publishing.
Person 3: Staff frontend integration.
Person 4: Driver frontend, session/ticket flows and QR interface.
Person 5: Simulator, hardware-side contract and end-to-end sensor integration.

Remaining integration checks:
- Confirm the simulator publishes the agreed MQTT topic and payload.
- Coordinate entrance/exit MQTT transport with Person 5.
- Verify sensor events update occupancy and reach connected WebSocket clients.
- Verify frontend authentication headers and response-field handling.
- Test the complete deployed frontend/backend flow before calling it production-verified.

This document is a backend handover, not production deployment approval.
