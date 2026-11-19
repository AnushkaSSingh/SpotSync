from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.booking import Booking


def expire_pending_bookings(
    db: Session,
    now: datetime | None = None,
) -> int:
    """Expire pending bookings whose checkout deadline has passed."""
    current_time = now or datetime.now(timezone.utc)

    try:
        bookings = db.scalars(
            select(Booking)
            .where(
                Booking.status == "pending",
                Booking.expires_at <= current_time,
            )
            .with_for_update(skip_locked=True)
        ).all()

        for booking in bookings:
            booking.status = "expired"

        if bookings:
            db.commit()

        return len(bookings)

    except Exception:
        db.rollback()
        raise


def run_booking_expiry() -> int:
    """Run the expiry task using its own database session."""
    db = SessionLocal()

    try:
        return expire_pending_bookings(db)
    finally:
        db.close()
