from apscheduler.schedulers.background import BackgroundScheduler

from app.tasks.prediction_refresh import refresh_predictions
from app.tasks.booking_expiry import run_booking_expiry
from app.tasks.payment_reconciliation import run_payment_reconciliation


scheduler = BackgroundScheduler()


def start_scheduler():
    if scheduler.running:
        return

    scheduler.add_job(
        refresh_predictions,
        "interval",
        minutes=30,
        id="prediction_refresh",
        replace_existing=True,
    )

    scheduler.add_job(
        run_booking_expiry,
        "interval",
        minutes=1,
        id="booking_expiry",
        replace_existing=True,
    )

    scheduler.add_job(
        run_payment_reconciliation,
        "interval",
        minutes=5,
        id="payment_reconciliation",
        replace_existing=True,
    )

    scheduler.start()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
