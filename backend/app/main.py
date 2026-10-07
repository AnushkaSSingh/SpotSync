from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(title="SpotSync")

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "SpotSync API is running"}
