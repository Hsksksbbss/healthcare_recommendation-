from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.diet_router import router as diet_router
from app.routers.health_router import router as health_router
from app.routers.places_router import router as places_router


app = FastAPI(title="HealthCare AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(diet_router)
app.include_router(places_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to the HealthCare AI API"}


@app.get("/health")
def read_health() -> dict[str, str]:
    return {"status": "healthy"}
