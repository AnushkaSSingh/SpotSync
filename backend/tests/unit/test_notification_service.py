from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.user import User
from app.models.notification import Notification
from app.services.notification_service import NotificationService


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    User.__table__.create(engine)
    Notification.__table__.create(engine)

    TestingSession = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
    )

    session = TestingSession()

    now = datetime.now(timezone.utc)

    session.execute(
        User.__table__.insert(),
        [
            {
                "id": 1,
                "name": "User One",
                "email": "user1@test.com",
                "password_hash": "test_hash",
                "role": "user",
                "is_active": True,
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": 2,
                "name": "User Two",
                "email": "user2@test.com",
                "password_hash": "test_hash",
                "role": "user",
                "is_active": True,
                "created_at": now,
                "updated_at": now,
            },
        ],
    )
    session.commit()

    yield session

    session.close()
    engine.dispose()


@pytest.fixture
def service():
    return NotificationService()


def create_notification(db, user_id, title, is_read=False):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=f"Message for {title}",
        notification_type="info",
        is_read=is_read,
        created_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def test_get_user_notifications_returns_only_requested_users_notifications(
    db, service
):
    create_notification(db, 1, "User 1 notification")
    create_notification(db, 2, "User 2 notification")
    create_notification(db, 1, "Another user 1 notification")

    notifications = service.get_user_notifications(db, 1)

    assert len(notifications) == 2
    assert all(item.user_id == 1 for item in notifications)
    assert notifications[0].id > notifications[1].id


def test_get_unread_count_excludes_read_notifications(db, service):
    create_notification(db, 1, "Unread 1")
    create_notification(db, 1, "Read", is_read=True)
    create_notification(db, 1, "Unread 2")
    create_notification(db, 2, "Other user's unread")

    assert service.get_unread_count(db, 1) == 2
    assert service.get_unread_count(db, 2) == 1


def test_mark_as_read_checks_notification_ownership(db, service):
    notification = create_notification(db, 1, "Private notification")

    result = service.mark_as_read(
        db,
        notification.id,
        user_id=2,
    )

    assert result is None

    db.refresh(notification)
    assert notification.is_read is False

    result = service.mark_as_read(
        db,
        notification.id,
        user_id=1,
    )

    assert result is not None
    assert result.is_read is True


def test_mark_all_as_read_updates_only_requested_users_notifications(
    db, service
):
    create_notification(db, 1, "User 1 unread")
    create_notification(db, 1, "User 1 read", is_read=True)
    create_notification(db, 1, "User 1 another unread")
    create_notification(db, 2, "User 2 unread")

    updated_count = service.mark_all_as_read(db, user_id=1)

    assert updated_count == 2
    assert service.get_unread_count(db, 1) == 0
    assert service.get_unread_count(db, 2) == 1


def test_mark_as_read_does_not_commit_if_already_read(db, service, monkeypatch):
    notification = create_notification(
        db,
        1,
        "Already read",
        is_read=True,
    )

    commit_calls = []
    original_commit = db.commit

    def tracked_commit():
        commit_calls.append(True)
        original_commit()

    monkeypatch.setattr(db, "commit", tracked_commit)

    result = service.mark_as_read(
        db,
        notification.id,
        user_id=1,
    )

    assert result is not None
    assert result.is_read is True
    assert commit_calls == []
