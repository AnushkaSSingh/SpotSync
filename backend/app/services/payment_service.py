from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.payment import Payment


def create_payment_order(
    db: Session,
    booking_id: int,
    user_id: int,
    amount: Decimal,
    currency: str = "INR",
):
    booking = db.get(Booking, booking_id)

    if not booking:
        raise ValueError("Booking not found")

    if booking.user_id != user_id:
        raise ValueError("You cannot pay for this booking")

    if booking.status == "cancelled":
        raise ValueError("Cancelled bookings cannot be paid")

    if amount != booking.total_amount:
        raise ValueError("Payment amount does not match booking amount")

    if currency != "INR":
        raise ValueError("Only INR payments are supported")

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking_id,
            Payment.status.in_(["created", "pending", "paid"]),
        )
        .first()
    )

    if existing_payment:
        raise ValueError("A payment already exists for this booking")

    # Mock payment order for development/testing.
    mock_order_id = f"mock_order_{booking_id}_{user_id}"

    payment = Payment(
        booking_id=booking_id,
        user_id=user_id,
        amount=amount,
        currency=currency,
        status="created",
        razorpay_order_id=mock_order_id,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    order = {
        "id": mock_order_id,
        "amount": int(amount * 100),
        "currency": currency,
        "status": "created",
    }

    return payment, order


def verify_payment(
    db: Session,
    payment_id: int,
    user_id: int,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
):
    payment = db.get(Payment, payment_id)

    if not payment:
        raise ValueError("Payment not found")

    if payment.user_id != user_id:
        raise ValueError("You cannot verify this payment")

    if payment.razorpay_order_id != razorpay_order_id:
        raise ValueError("Payment order ID does not match")

    # Mock verification for development/testing.
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = "paid"

    db.commit()
    db.refresh(payment)

    return payment
