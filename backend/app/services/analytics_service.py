from sqlalchemy.orm import Session

from app.repositories.analytics_repository import (
    get_prediction_statistics,
    get_slot_statistics,
)


class AnalyticsService:

    def get_parking_analytics(
        self,
        db: Session,
        parking_lot_id: int,
    ):
        prediction_stats = get_prediction_statistics(
            db,
            parking_lot_id,
        )

        slot_stats = get_slot_statistics(
            db,
            parking_lot_id,
        )

        total_slots = slot_stats["total_slots"]

        if total_slots > 0:
            occupancy_rate = (
                slot_stats["occupied_slots"] / total_slots
            )
        else:
            occupancy_rate = 0.0

        return {
            "parking_lot_id": parking_lot_id,
            "slots": slot_stats,
            "current_occupancy_rate": round(
                occupancy_rate,
                4,
            ),
            "predictions": prediction_stats,
        }


analytics_service = AnalyticsService()
