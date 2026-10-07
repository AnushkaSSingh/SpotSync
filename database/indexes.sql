-- SpotSync Database Indexes
-- Owner: Vanshika

-- ============================================================
-- USER LOOKUPS
-- ============================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_role
ON users(role);


-- ============================================================
-- VEHICLE LOOKUPS
-- ============================================================

CREATE INDEX idx_vehicles_user_id
ON vehicles(user_id);

CREATE INDEX idx_vehicles_vehicle_number
ON vehicles(vehicle_number);


-- ============================================================
-- PARKING LOOKUPS
-- ============================================================

CREATE INDEX idx_parking_lots_active
ON parking_lots(is_active);

CREATE INDEX idx_parking_slots_lot_id
ON parking_slots(parking_lot_id);

CREATE INDEX idx_parking_slots_available
ON parking_slots(is_available);


-- ============================================================
-- BOOKING LOOKUPS
-- ============================================================

CREATE INDEX idx_bookings_user_id
ON bookings(user_id);

CREATE INDEX idx_bookings_vehicle_id
ON bookings(vehicle_id);

CREATE INDEX idx_bookings_slot_id
ON bookings(parking_slot_id);

CREATE INDEX idx_bookings_status
ON bookings(status);

CREATE INDEX idx_bookings_start_time
ON bookings(start_time);

CREATE INDEX idx_bookings_end_time
ON bookings(end_time);


-- ============================================================
-- PAYMENT LOOKUPS
-- ============================================================

CREATE INDEX idx_payments_booking_id
ON payments(booking_id);

CREATE INDEX idx_payments_user_id
ON payments(user_id);

CREATE INDEX idx_payments_status
ON payments(status);


-- ============================================================
-- REFUND LOOKUPS
-- ============================================================

CREATE INDEX idx_refunds_payment_id
ON refunds(payment_id);

CREATE INDEX idx_refunds_status
ON refunds(status);