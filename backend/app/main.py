from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.payments import router as payments_router

app = FastAPI(title="SpotSync")

app.include_router(auth_router)
app.include_router(payments_router)


@app.get("/")
def root():
    return {"message": "SpotSync API is running"}
