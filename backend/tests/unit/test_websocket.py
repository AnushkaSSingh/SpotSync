import asyncio

from app.websocket.connection_manager import ConnectionManager


class FakeWebSocket:
    def __init__(self, should_fail=False):
        self.accepted = False
        self.messages = []
        self.should_fail = should_fail

    async def accept(self):
        self.accepted = True

    async def send_json(self, message):
        if self.should_fail:
            raise RuntimeError("Connection failed")
        self.messages.append(message)


def test_connect_accepts_and_registers_client():
    async def run():
        manager = ConnectionManager()
        websocket = FakeWebSocket()

        await manager.connect(websocket)

        assert websocket.accepted is True
        assert websocket in manager.connections
        assert manager.loop is asyncio.get_running_loop()

    asyncio.run(run())


def test_broadcast_sends_message_to_connected_clients():
    async def run():
        manager = ConnectionManager()
        first = FakeWebSocket()
        second = FakeWebSocket()

        await manager.connect(first)
        await manager.connect(second)

        message = {"type": "parking_update", "data": {"slot_id": 1}}
        await manager.broadcast(message)

        assert first.messages == [message]
        assert second.messages == [message]

    asyncio.run(run())


def test_broadcast_removes_failed_connections():
    async def run():
        manager = ConnectionManager()
        working = FakeWebSocket()
        failed = FakeWebSocket(should_fail=True)

        await manager.connect(working)
        await manager.connect(failed)

        await manager.broadcast({"type": "parking_update"})

        assert working in manager.connections
        assert failed not in manager.connections

    asyncio.run(run())


def test_disconnect_removes_client():
    async def run():
        manager = ConnectionManager()
        websocket = FakeWebSocket()

        await manager.connect(websocket)
        manager.disconnect(websocket)

        assert websocket not in manager.connections

    asyncio.run(run())


def test_publish_parking_update_broadcasts_message(monkeypatch):
    from app.websocket import parking_updates

    async def run():
        manager = ConnectionManager()
        websocket = FakeWebSocket()

        await manager.connect(websocket)
        monkeypatch.setattr(
            parking_updates,
            "connection_manager",
            manager,
        )

        data = {"slot_id": 5, "status": "OCCUPIED"}

        parking_updates.publish_parking_update(data)

        await asyncio.sleep(0.01)

        assert websocket.messages == [
            {
                "type": "parking_update",
                "data": data,
            }
        ]

    asyncio.run(run())
