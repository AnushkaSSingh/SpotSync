from unittest.mock import MagicMock

from app.tasks import scheduler as scheduler_module


def test_start_scheduler_registers_all_jobs(monkeypatch):
    fake_scheduler = MagicMock()
    fake_scheduler.running = False

    monkeypatch.setattr(scheduler_module, "scheduler", fake_scheduler)

    scheduler_module.start_scheduler()

    assert fake_scheduler.add_job.call_count == 3

    jobs = {
        call.kwargs["id"]: call
        for call in fake_scheduler.add_job.call_args_list
    }

    assert "prediction_refresh" in jobs
    assert "booking_expiry" in jobs
    assert "payment_reconciliation" in jobs

    assert jobs["booking_expiry"].args[0] is scheduler_module.run_booking_expiry
    assert jobs["booking_expiry"].kwargs["minutes"] == 1

    assert jobs["payment_reconciliation"].args[0] is scheduler_module.run_payment_reconciliation
    assert jobs["payment_reconciliation"].kwargs["minutes"] == 5

    fake_scheduler.start.assert_called_once()


def test_start_scheduler_does_not_start_twice(monkeypatch):
    fake_scheduler = MagicMock()
    fake_scheduler.running = True

    monkeypatch.setattr(scheduler_module, "scheduler", fake_scheduler)

    scheduler_module.start_scheduler()

    fake_scheduler.add_job.assert_not_called()
    fake_scheduler.start.assert_not_called()


def test_stop_scheduler_shuts_down_running_scheduler(monkeypatch):
    fake_scheduler = MagicMock()
    fake_scheduler.running = True

    monkeypatch.setattr(scheduler_module, "scheduler", fake_scheduler)

    scheduler_module.stop_scheduler()

    fake_scheduler.shutdown.assert_called_once()
