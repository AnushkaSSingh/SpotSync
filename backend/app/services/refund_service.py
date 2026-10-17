from decimal import Decimal

import razorpay
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.payment import Payment
from app.models.refund import Refund


def create_refund(
    db: Session,
    payment_id: int,
    user_id: int,
    amount: Decimal,
    reason: str | None = None,
):
    payment = db.get(Payment, payment_id)

    if not payment:
        raise ValueError("Payment not found")
    if payment.user_id != user_id:
        raise ValueError("You cannot refund this payment")
    if payment.status not in ("paid", "partially_refunded"):
        raise ValueError("Only paid or partially refunded payments can be refunded")
    if amount <= 0:
        raise ValueError("Refund amount must be greater than zero")
    if not payment.razorpay_payment_id:
        raise ValueError("Payment has no provider payment ID")

    previous_refunds = (
        db.query(Refund)
        .filter(Refund.payment_id == payment.id)
        .all()
    )

    # Only provider-confirmed refunds count against the refundable balance.
    already_refunded = sum(
        (refund.amount for refund in previous_refunds
         if refund.status == "processed"),
        Decimal("0"),
    )

    if already_refunded + amount > payment.amount:
        raise ValueError("Refund amount exceeds remaining payment amount")

    mode = settings.payment_mode.lower()

    if mode == "mock":
        refund_id = f"mock_refund_{payment.id}_{len(previous_refunds) + 1}"
        refund_status = "mock"
    elif mode == "razorpay":
        try:
            client = razorpay.Client(
                auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
            )
            payload = {"amount": int(amount * 100)}
            if reason:
                payload["notes"] = {"reason": reason[:256]}

            provider_refund = client.payment.refund(
                payment.razorpay_payment_id,
                payload,
            )
            refund_id = provider_refund["id"]
            provider_status = provider_refund.get("status", "pending")
            refund_status = (
                "processed" if provider_status == "processed"
                else "pending"
            )
        except Exception as exc:
            raise ValueError("Razorpay refund request failed") from exc
    else:
        raise ValueError("Invalid payment mode configuration")

    refund = Refund(
        payment_id=payment.id,
        amount=amount,
        status=refund_status,
        razorpay_refund_id=refund_id,
        reason=reason,
    )
    db.add(refund)

    if refund_status == "processed" and already_refunded + amount == payment.amount:
        payment.status = "refunded"
    elif refund_status == "processed":
        payment.status = "partially_refunded"

    db.commit()
    db.refresh(refund)
    return refund
