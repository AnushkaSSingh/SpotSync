
from contextlib import asynccontextmanager
from threading import Thread

from fastapi import FastAPI

from app.api.router import api_router
from app.mqtt.client import create_mqtt_client
from app.mqtt.subscriber import on_connect, on_message


@asynccontextmanager
async def lifespan(app: FastAPI):
    mqtt_client = create_mqtt_client()

    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    mqtt_thread = Thread(
        target=mqtt_client.loop_forever,
        daemon=True,
    )
    mqtt_thread.start()

    yield

    mqtt_client.disconnect()


app = FastAPI(
    title="SpotSync",
    lifespan=lifespan,
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "SpotSync API is running"}
