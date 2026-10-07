from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id: Mapped[int] = mapped_column(primary_key=True)

    parking_lot_id: Mapped[int] = mapped_column(
        ForeignKey("parking_lots.id", ondelete="CASCADE"),
        nullable=False,
    )

    slot_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    slot_type: Mapped[str] = mapped_column(
        String(30),
        default="regular",
        nullable=False,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    parking_lot = relationship(
        "ParkingLot",
        back_populates="slots",
    )

    bookings = relationship(
        "Booking",
        back_populates="parking_slot",
    )