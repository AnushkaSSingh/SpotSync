from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    parking_lot_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("parking_lots.id", ondelete="CASCADE"),
        nullable=False,
    )

    sensor_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    is_online: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    last_seen_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    sensor_code: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    parking_slot_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("parking_slots.id"),
        nullable=True,
    )
