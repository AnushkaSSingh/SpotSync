from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.tasks import payment_reconciliation as task


def make_records(refund_status="pending", payment_status="paid"):
    payment = SimpleNamespace(
        id=10,
        amount=Decimal("500.00"),
        status=payment_status,
        razorpay_payment_id="pay_test_123",
    )
    refund = SimpleNamespace(
        id=20,
        payment_id=10,
        amount=Decimal("500.00"),
        status=refund_status,
        razorpay_refund_id="rfnd_test_123",
    )
    return payment, refund


def make_db(payment, refund, processed_total=Decimal("0")):
    db = MagicMock()
    db.scalars.return_value.all.return_value = [refund]
    db.get.return_value = payment
    db.scalar.return_value = processed_total
    return db


def make_client(status="processed"):
    client = MagicMock()
    client.payment.fetch_refund_id.return_value = {"status": status}
    return client


def test_reconciles_processed_refund(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "razorpay"
    )
    payment, refund = make_records()
    db = make_db(payment, refund)
    client = make_client("processed")

    result = task.reconcile_pending_refunds(db, client)

    assert result == 1
    assert refund.status == "processed"
    assert payment.status == "refunded"
    db.commit.assert_called_once()


def test_reconciles_failed_refund(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "razorpay"
    )
    payment, refund = make_records()
    db = make_db(payment, refund)
    client = make_client("failed")

    result = task.reconcile_pending_refunds(db, client)

    assert result == 1
    assert refund.status == "failed"
    assert payment.status == "paid"
    db.commit.assert_called_once()


def test_keeps_pending_when_provider_reports_pending(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "razorpay"
    )
    payment, refund = make_records()
    db = make_db(payment, refund)
    client = make_client("pending")

    result = task.reconcile_pending_refunds(db, client)

    assert result == 0
    assert refund.status == "pending"
    db.commit.assert_not_called()


def test_provider_error_does_not_change_refund(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "razorpay"
    )
    payment, refund = make_records()
    db = make_db(payment, refund)
    client = MagicMock()
    client.payment.fetch_refund_id.side_effect = RuntimeError("Provider unavailable")

    result = task.reconcile_pending_refunds(db, client)

    assert result == 0
    assert refund.status == "pending"
    db.commit.assert_not_called()


def test_mock_mode_skips_reconciliation(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "mock"
    )
    payment, refund = make_records()
    db = make_db(payment, refund)
    client = make_client()

    result = task.reconcile_pending_refunds(db, client)

    assert result == 0
    client.payment.fetch_refund_id.assert_not_called()
    db.commit.assert_not_called()


def test_partial_refund_updates_payment_status(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "razorpay"
    )
    payment, refund = make_records()
    refund.amount = Decimal("200.00")
    db = make_db(payment, refund, Decimal("200.00"))
    client = make_client("processed")

    result = task.reconcile_pending_refunds(db, client)

    assert result == 1
    assert refund.status == "processed"
    assert payment.status == "partially_refunded"


def test_no_pending_refunds_does_not_commit(monkeypatch):
    monkeypatch.setattr(
        task.settings, "payment_mode", "razorpay"
    )
    payment, refund = make_records()
    db = make_db(payment, refund)
    db.scalars.return_value.all.return_value = []
    client = make_client()

    result = task.reconcile_pending_refunds(db, client)

    assert result == 0
    client.payment.fetch_refund_id.assert_not_called()
    db.commit.assert_not_called()
