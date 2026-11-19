from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.parking_session import ParkingSession
from app.models.parking_slot import ParkingSlot


def get_slot_for_update(db: Session, slot_id: int):
    statement = (
        select(ParkingSlot)
        .where(ParkingSlot.id == slot_id)
        .with_for_update()
    )
    return db.scalars(statement).first()


def get_active_session_for_slot(db: Session, slot_id: int):
    statement = select(ParkingSession).where(
        ParkingSession.parking_slot_id == slot_id,
        ParkingSession.status == "ACTIVE",
    )
    return db.scalars(statement).first()


def get_session_for_user_for_update(
    db: Session,
    session_id: int,
    user_id: int,
):
    statement = (
        select(ParkingSession)
        .where(
            ParkingSession.id == session_id,
            ParkingSession.user_id == user_id,
        )
        .with_for_update()
    )
    return db.scalars(statement).first()


def get_session_by_id(db: Session, session_id: int):
    return db.get(ParkingSession, session_id)


def list_sessions_for_user(db: Session, user_id: int):
    statement = (
        select(ParkingSession)
        .where(ParkingSession.user_id == user_id)
        .order_by(ParkingSession.started_at.desc())
    )
    return db.scalars(statement).all()


def create_session(
    db: Session,
    *,
    parking_lot_id: int,
    parking_slot_id: int,
    user_id: int,
    vehicle_id: int,
):
    session = ParkingSession(
        parking_lot_id=parking_lot_id,
        parking_slot_id=parking_slot_id,
        user_id=user_id,
        vehicle_id=vehicle_id,
        status="ACTIVE",
    )
    db.add(session)
    db.flush()
    return session


def get_active_session_for_slot_for_update(db: Session, slot_id: int):
    statement = (
        select(ParkingSession)
        .where(
            ParkingSession.parking_slot_id == slot_id,
            ParkingSession.status == "ACTIVE",
        )
        .with_for_update()
    )
    return db.scalars(statement).first()
