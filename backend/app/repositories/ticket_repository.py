from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ticket_token import TicketToken


def revoke_unused_session_tokens(db: Session, session_id: int, now):
    statement = (
        select(TicketToken)
        .where(
            TicketToken.parking_session_id == session_id,
            TicketToken.revoked_at.is_(None),
            TicketToken.used_at.is_(None),
        )
        .with_for_update()
    )
    tokens = db.scalars(statement).all()

    for token in tokens:
        token.revoked_at = now


def create_ticket_token(
    db: Session,
    session_id: int,
    token_hash: str,
    expires_at,
):
    token = TicketToken(
        parking_session_id=session_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(token)
    db.flush()
    return token


def get_token_for_update(db: Session, token_hash: str):
    statement = (
        select(TicketToken)
        .where(TicketToken.token_hash == token_hash)
        .with_for_update()
    )
    return db.scalars(statement).first()
