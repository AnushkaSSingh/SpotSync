from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.schemas.notification import NotificationListResponse
from app.services.notification_service import notification_service


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=NotificationListResponse,
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notifications = notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
    )

    return {
        "notifications": [
            {
                "id": item.id,
                "user_id": item.user_id,
                "title": item.title,
                "message": item.message,
                "notification_type": item.notification_type,
                "is_read": item.is_read,
            }
            for item in notifications
        ]
    }


@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notification = notification_service.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "is_read": notification.is_read,
    }


@router.get("/unread-count")
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    count = notification_service.get_unread_count(
        db=db,
        user_id=current_user.id,
    )
    return {"unread_count": count}


@router.post("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updated_count = notification_service.mark_all_as_read(
        db=db,
        user_id=current_user.id,
    )
    return {"updated_count": updated_count}
