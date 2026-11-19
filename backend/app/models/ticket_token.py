from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CHAR,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TicketToken(Base):
    __tablename__ = "ticket_tokens"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)

    parking_session_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("parking_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    token_hash: Mapped[str] = mapped_column(
        CHAR(64), nullable=False, unique=True
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            "token_hash ~ '^[0-9a-f]{64}$'",
            name="ck_ticket_tokens_sha256_hex",
        ),
        Index("ix_ticket_tokens_session", "parking_session_id"),
        Index(
            "ix_ticket_tokens_expiry",
            "expires_at",
            postgresql_where=text(
                "revoked_at IS NULL AND used_at IS NULL"
            ),
        ),
    )
