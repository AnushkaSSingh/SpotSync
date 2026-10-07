from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(
        select(User).where(User.email == email)
    )


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.scalar(
        select(User).where(User.id == user_id)
    )


def create_user(
    db: Session,
    name: str,
    email: str,
    phone: str | None,
    password_hash: str,
    role: str = "user",
) -> User:
    user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=password_hash,
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user