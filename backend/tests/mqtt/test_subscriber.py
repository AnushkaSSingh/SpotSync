from types import SimpleNamespace
from unittest.mock import call, MagicMock

from app.mqtt import subscriber


def test_on_connect_subscribes_to_occupancy_topic():
    client = MagicMock()

    subscriber.on_connect(client, None, None, 0, None)

    assert client.subscribe.call_args_list == [
        call("spotsync/parking/+/occupancy"),
        call("spotsync/sensors/+/events"),
    ]


def test_on_connect_does_not_subscribe_when_connection_fails():
    client = MagicMock()

    subscriber.on_connect(client, None, None, 5, None)

    client.subscribe.assert_not_called()


def test_on_message_processes_payload_and_closes_database(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(subscriber, "SessionLocal", lambda: db)
    handler = MagicMock(return_value=True)
    monkeypatch.setattr(subscriber, "handle_sensor_message", handler)
    message = SimpleNamespace(
        payload=b'{"sensor_id":"S1"}',
        topic="spotsync/parking/A1/occupancy",
    )

    subscriber.on_message(MagicMock(), None, message)

    handler.assert_called_once_with(db, message.payload)
    db.close.assert_called_once()
    db.rollback.assert_not_called()


def test_on_message_rolls_back_on_processing_error(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(subscriber, "SessionLocal", lambda: db)
    handler = MagicMock(side_effect=RuntimeError("processing failed"))
    monkeypatch.setattr(subscriber, "handle_sensor_message", handler)
    message = SimpleNamespace(
        payload=b'{}',
        topic="spotsync/parking/A1/occupancy",
    )

    subscriber.on_message(MagicMock(), None, message)

    db.rollback.assert_called_once()
    db.close.assert_called_once()


def test_subscriber_start_and_stop_lifecycle(monkeypatch):
    client = MagicMock()
    monkeypatch.setattr(subscriber, "_mqtt_client", None)
    monkeypatch.setattr(subscriber, "create_mqtt_client", lambda: client)
    monkeypatch.setattr(subscriber.settings, "mqtt_broker", "test-broker")
    monkeypatch.setattr(subscriber.settings, "mqtt_port", 1883)

    subscriber.start_mqtt_subscriber()
    subscriber.start_mqtt_subscriber()

    client.connect_async.assert_called_once_with(
        "test-broker",
        1883,
        keepalive=60,
    )
    client.loop_start.assert_called_once()
    assert client.on_connect is subscriber.on_connect
    assert client.on_message is subscriber.on_message

    subscriber.stop_mqtt_subscriber()

    client.disconnect.assert_called_once()
    client.loop_stop.assert_called_once()
    assert subscriber._mqtt_client is None
