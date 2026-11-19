from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    FetchedValue,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ParkingSession(Base):
    __tablename__ = "parking_sessions"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
    )

    parking_lot_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    parking_slot_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    user_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    vehicle_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey("vehicles.id", ondelete="SET NULL"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVE",
        server_default=text("'ACTIVE'"),
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        server_onupdate=FetchedValue(),
    )

    __table_args__ = (
        ForeignKeyConstraint(
            ["parking_lot_id", "parking_slot_id"],
            ["parking_slots.parking_lot_id", "parking_slots.id"],
            name="fk_parking_sessions_slot_in_lot",
            ondelete="RESTRICT",
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED')",
            name="ck_parking_sessions_status",
        ),
        CheckConstraint(
            "ended_at IS NULL OR ended_at >= started_at",
            name="ck_parking_sessions_time_order",
        ),
        CheckConstraint(
            "status <> 'ACTIVE' OR ended_at IS NULL",
            name="ck_active_session_has_no_end_time",
        ),
        Index(
            "uq_parking_sessions_one_active_per_slot",
            "parking_slot_id",
            unique=True,
            postgresql_where=text("status = 'ACTIVE'"),
        ),
        Index(
            "ix_parking_sessions_lot_started",
            "parking_lot_id",
            text("started_at DESC"),
        ),
        Index(
            "ix_parking_sessions_user_started",
            "user_id",
            text("started_at DESC"),
            postgresql_where=text("user_id IS NOT NULL"),
        ),
    )
