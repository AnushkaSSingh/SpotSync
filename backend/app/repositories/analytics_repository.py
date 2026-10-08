from sqlalchemy import select, func, Integer
from sqlalchemy.orm import Session

from app.models.parking_slot import ParkingSlot
from app.models.prediction import Prediction


def get_prediction_statistics(db: Session, parking_lot_id: int):
    statement = select(
        func.count(Prediction.id),
        func.avg(Prediction.predicted_occupancy),
        func.max(Prediction.predicted_occupancy),
        func.min(Prediction.predicted_occupancy),
    ).where(
        Prediction.parking_lot_id == parking_lot_id
    )

    count, average, maximum, minimum = db.execute(statement).one()

    return {
        "prediction_count": count or 0,
        "average_occupancy": round(float(average or 0), 4),
        "maximum_occupancy": round(float(maximum or 0), 4),
        "minimum_occupancy": round(float(minimum or 0), 4),
    }


def get_slot_statistics(db: Session, parking_lot_id: int):
    statement = select(
        func.count(ParkingSlot.id),
        func.sum(
            func.cast(ParkingSlot.is_available, Integer)
        ),
    ).where(
        ParkingSlot.parking_lot_id == parking_lot_id
    )

    total, available = db.execute(statement).one()

    total = total or 0
    available = available or 0
    occupied = total - available

    return {
        "total_slots": total,
        "available_slots": available,
        "occupied_slots": occupied,
    }
