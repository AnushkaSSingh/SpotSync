import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.notification import Notification


logger = logging.getLogger(__name__)


class NotificationService:

    def create(
        self,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "info",
    ):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            is_read=False,
            created_at=datetime.now(timezone.utc),
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    def create_safely(
        self,
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "info",
    ):
        try:
            return self.create(
                db,
                user_id,
                title,
                message,
                notification_type,
            )
        except Exception:
            db.rollback()
            logger.exception(
                "Could not create notification for user_id=%s",
                user_id,
            )
            return None

    def get_user_notifications(
        self,
        db: Session,
        user_id: int,
    ):
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.id.desc())
            .all()
        )



    def get_unread_count(self, db: Session, user_id: int) -> int:
        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .count()
        )


    def mark_all_as_read(self, db: Session, user_id: int) -> int:
        updated_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .update(
                {Notification.is_read: True},
                synchronize_session=False,
            )
        )
        if updated_count:
            db.commit()
        return updated_count

    def mark_as_read(
        self,
        db: Session,
        notification_id: int,
        user_id: int,
    ):
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if notification is None:
            return None

        if not notification.is_read:
            notification.is_read = True
            db.commit()
            db.refresh(notification)

        return notification


notification_service = NotificationService()
