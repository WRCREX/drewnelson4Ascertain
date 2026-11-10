import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, patients
from app.core.config import settings
from app.db.seed import seed_if_empty
from app.db.session import SessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Seed on boot; schema itself is owned by Alembic migrations."""
    if settings.seed_on_startup:
        async with SessionLocal() as db:
            await seed_if_empty(db)
    yield


app = FastAPI(title="Healthcare Dashboard API", version="1.0.0", lifespan=lifespan)

logger = logging.getLogger("app.requests")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Structured request log: method, path, status, duration."""
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %d (%.1fms)", request.method, request.url.path, response.status_code, duration_ms
    )
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Flatten Pydantic errors into field->message pairs the form UI can display."""
    errors = [
        {"field": ".".join(str(loc) for loc in e["loc"] if loc != "body"), "message": e["msg"]}
        for e in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation failed", "errors": errors},
    )


app.include_router(health.router)
app.include_router(patients.router)
