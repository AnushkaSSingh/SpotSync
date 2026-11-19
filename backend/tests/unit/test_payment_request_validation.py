import pytest
from pydantic import ValidationError

from app.api.routes.payments import (
    CreatePaymentRequest,
    RefundRequest,
    VerifyPaymentRequest,
)


@pytest.mark.parametrize(
    "payload",
    [
        {"booking_id": 0, "amount": "10.00"},
        {"booking_id": 1, "amount": "0"},
        {"booking_id": 1, "amount": "-10.00"},
    ],
)
def test_create_payment_rejects_invalid_id_or_amount(payload):
    with pytest.raises(ValidationError):
        CreatePaymentRequest.model_validate(payload)


@pytest.mark.parametrize(
    "payload",
    [
        {"payment_id": 0, "amount": "10.00"},
        {"payment_id": 1, "amount": "0"},
        {"payment_id": 1, "amount": "-10.00"},
    ],
)
def test_refund_rejects_invalid_id_or_amount(payload):
    with pytest.raises(ValidationError):
        RefundRequest.model_validate(payload)


def test_verify_payment_rejects_non_positive_payment_id():
    with pytest.raises(ValidationError):
        VerifyPaymentRequest.model_validate(
            {
                "payment_id": 0,
                "razorpay_order_id": "order_123",
                "razorpay_payment_id": "payment_123",
                "razorpay_signature": "signature_123",
            }
        )
