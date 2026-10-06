from decimal import Decimal

from sqlalchemy.orm import Session

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

    if payment.status != "paid":
        raise ValueError("Only paid payments can be refunded")

    if amount <= 0:
        raise ValueError("Refund amount must be greater than zero")

    previous_refunds = (
        db.query(Refund)
        .filter(Refund.payment_id == payment.id)
        .all()
    )

    already_refunded = sum(
        (refund.amount for refund in previous_refunds),
        Decimal("0"),
    )

    if already_refunded + amount > payment.amount:
        raise ValueError("Refund amount exceeds remaining payment amount")

    # Mock refund for development/testing.
    mock_refund_id = f"mock_refund_{payment.id}_{len(previous_refunds) + 1}"

    refund = Refund(
        payment_id=payment.id,
        amount=amount,
        status="processed",
        razorpay_refund_id=mock_refund_id,
        reason=reason,
    )

    db.add(refund)

    if already_refunded + amount == payment.amount:
        payment.status = "refunded"

    db.commit()
    db.refresh(refund)

    return refund