from decimal import Decimal

import razorpay
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.payment import Payment
from app.models.refund import Refund


def reconcile_pending_refunds(db: Session, client=None) -> int:
    """Synchronize pending Razorpay refunds with the provider."""
    if settings.payment_mode.strip().lower() != "razorpay":
        return 0

    if client is None:
        if not settings.razorpay_key_id or not settings.razorpay_key_secret:
            raise ValueError("Razorpay credentials are not configured")

        client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )

    try:
        refunds = db.scalars(
            select(Refund)
            .join(Payment, Payment.id == Refund.payment_id)
            .where(
                Refund.status == "pending",
                Refund.razorpay_refund_id.is_not(None),
                Payment.razorpay_payment_id.is_not(None),
            )
            .order_by(Refund.id)
            .with_for_update(of=Refund, skip_locked=True)
        ).all()

        reconciled = 0
        affected_payment_ids = set()

        for refund in refunds:
            payment = db.get(Payment, refund.payment_id)
            if payment is None:
                continue

            try:
                provider_refund = client.payment.fetch_refund_id(
                    payment.razorpay_payment_id,
                    refund.razorpay_refund_id,
                )
            except Exception:
                # A temporary provider failure must not change refund status.
                continue

            provider_status = str(
                provider_refund.get("status", "")
            ).strip().lower()

            if provider_status == "processed":
                refund.status = "processed"
            elif provider_status == "failed":
                refund.status = "failed"
            else:
                # Keep created, pending, and unknown states pending.
                continue

            reconciled += 1
            affected_payment_ids.add(payment.id)

        for payment_id in affected_payment_ids:
            payment = db.get(Payment, payment_id)
            payment_refunds = db.scalars(
                select(Refund).where(Refund.payment_id == payment_id)
            ).all()

            processed_total = sum(
                (
                    item.amount
                    for item in payment_refunds
                    if item.status == "processed"
                ),
                Decimal("0"),
            )

            if processed_total >= Decimal(str(payment.amount)):
                payment.status = "refunded"
            elif processed_total > 0:
                payment.status = "partially_refunded"
            else:
                payment.status = "paid"

        if reconciled:
            db.commit()

        return reconciled

    except Exception:
        db.rollback()
        raise


def run_payment_reconciliation() -> int:
    db = SessionLocal()
    try:
        return reconcile_pending_refunds(db)
    finally:
        db.close()
