from sqlalchemy import BigInteger, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    parking_lot_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("parking_lots.id", ondelete="CASCADE"),
        nullable=False,
    )

    sensor_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("sensors.id", ondelete="SET NULL"),
        nullable=True,
    )

    incident_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="open",
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
