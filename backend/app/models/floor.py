
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Floor(Base):
    __tablename__ = "floors"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    parking_lot_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("parking_lots.id", ondelete="CASCADE"),
        nullable=False,
    )

    floor_code: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    floor_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
