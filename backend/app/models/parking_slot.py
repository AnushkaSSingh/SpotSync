from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    __table_args__ = (
        UniqueConstraint(
            "parking_lot_id", "id",
            name="uq_parking_slots_lot_id_id",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    parking_lot_id: Mapped[int] = mapped_column(
        BigInteger,
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

    floor_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("floors.id"),
        nullable=True,
    )

    display_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="UNKNOWN",
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
