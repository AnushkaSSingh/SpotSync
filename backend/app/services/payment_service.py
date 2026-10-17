from decimal import Decimal

import razorpay
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.booking import Booking
from app.models.payment import Payment


def _razorpay_client():
    return razorpay.Client(
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
    )


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
    if booking.status in ("cancelled", "completed"):
        raise ValueError("This booking cannot be paid")
    if amount != booking.total_amount:
        raise ValueError("Payment amount does not match booking amount")
    if currency != "INR":
        raise ValueError("Only INR payments are supported")
    if settings.payment_mode.lower() not in ("razorpay", "mock"):
        raise ValueError("Invalid payment mode configuration")

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

    if settings.payment_mode.lower() == "mock":
        order_id = f"mock_order_{booking_id}_{user_id}"
    else:
        try:
            order_data = _razorpay_client().order.create({
                "amount": int(amount * 100),
                "currency": currency,
                "receipt": f"booking_{booking_id}",
            })
            order_id = order_data["id"]
        except Exception as exc:
            raise ValueError("Could not create Razorpay order") from exc

    payment = Payment(
        booking_id=booking_id,
        user_id=user_id,
        amount=amount,
        currency=currency,
        status="created",
        razorpay_order_id=order_id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment, {
        "id": order_id,
        "amount": int(amount * 100),
        "currency": currency,
        "status": "created",
    }


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
    if payment.status == "paid":
        raise ValueError("This payment has already been verified")
    if payment.status not in ("created", "pending"):
        raise ValueError("This payment cannot be verified")
    if not razorpay_payment_id or not razorpay_signature:
        raise ValueError("Payment verification details are required")

    if settings.payment_mode.lower() == "mock":
        # Development only: these mock values are not proof of a real payment.
        if not razorpay_order_id.startswith("mock_order_"):
            raise ValueError("Invalid mock order")
    else:
        try:
            _razorpay_client().utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })
        except Exception as exc:
            raise ValueError("Razorpay payment signature verification failed") from exc

    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = "paid"
    db.commit()
    db.refresh(payment)
    return payment
