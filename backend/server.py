"""FastAPI service for MovieAI — Movie Rating Prediction AI.

Exposes REST endpoints powered by the ML service. Predictions can be
saved to MongoDB and shared via a short id; documents auto-expire via a
TTL index.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import APIRouter, Body, FastAPI, HTTPException, Query, Request
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.cors import CORSMiddleware

from ml_service import ml_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# --- MongoDB ---------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[db_name]
predictions_col = db["predictions"]
SHARE_TTL_DAYS = int(os.environ.get("SHARE_TTL_DAYS", "30"))

app = FastAPI(title="MovieAI – Movie Rating Prediction API", version="1.3.0")

# --- Rate limiting (slowapi, IP-based) -------------------------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------
class PredictRequest(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    year: int = Field(..., ge=1900, le=2100)
    votes: int = Field(..., ge=0, le=10_000_000)
    duration: float = Field(..., gt=0, le=600)
    genre: str = Field(..., min_length=1, max_length=80)
    director: str = Field(..., min_length=1, max_length=160)
    actor1: str = Field(..., min_length=1, max_length=160)
    actor2: str = Field(..., min_length=1, max_length=160)
    actor3: str = Field(..., min_length=1, max_length=160)


class SentimentRequest(BaseModel):
    review: str = Field(..., min_length=1, max_length=5000)


class FinalRatingRequest(BaseModel):
    predicted_rating: float = Field(..., ge=0, le=10)
    review: str | None = Field(default=None, max_length=5000)


class CompareRequest(BaseModel):
    movie_a: PredictRequest
    movie_b: PredictRequest


# --- Share payload (strict schema) -----------------------------------
class ShareInput(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    year: int = Field(..., ge=1900, le=2100)
    votes: int = Field(..., ge=0)
    duration: float = Field(..., gt=0, le=600)
    genre: str = Field(..., max_length=80)
    director: str = Field(..., max_length=160)
    actor1: str = Field(..., max_length=160)
    actor2: str = Field(..., max_length=160)
    actor3: str = Field(..., max_length=160)


class Impacts(BaseModel):
    director: float
    genre: float
    cast: float
    votes: float


class ShareResult(BaseModel):
    predicted_rating: float = Field(..., ge=0, le=10)
    confidence: float = Field(..., ge=0, le=100)
    std: float | None = None
    impacts: Impacts
    features_used: dict[str, float | int] = Field(default_factory=dict)
    feature_importances: dict[str, float] = Field(default_factory=dict)
    global_mean_rating: float | None = None
    movie_name: str | None = None

    @field_validator("features_used", "feature_importances")
    @classmethod
    def _cap_dict_size(cls, v: dict) -> dict:
        # Defence-in-depth: prevent abuse via huge dicts
        if len(v) > 32:
            raise ValueError("Too many entries (max 32)")
        for key in v.keys():
            if not isinstance(key, str) or len(key) > 80:
                raise ValueError("Invalid key — must be string ≤ 80 chars")
        return v


class ShareSentiment(BaseModel):
    polarity: float
    subjectivity: float
    label: str
    confidence: float
    adjustment: float


class ShareFinal(BaseModel):
    predicted_rating: float
    sentiment: ShareSentiment
    adjustment: float
    final_rating: float = Field(..., ge=0, le=10)


class SharePredictionRequest(BaseModel):
    input: ShareInput
    result: ShareResult
    review: str | None = Field(default=None, max_length=5000)
    final: ShareFinal | None = None


# ---------------------------------------------------------------------
# Lifecycle: TTL index for share docs
# ---------------------------------------------------------------------
@app.on_event("startup")
async def _ensure_indexes() -> None:
    try:
        # Date-based TTL on a real datetime field (`expires_at`).
        await predictions_col.create_index(
            "expires_at",
            expireAfterSeconds=0,
            name="ttl_expires_at",
        )
        await predictions_col.create_index("id", unique=True, name="unique_share_id")
        logger.info(
            "Mongo indexes ensured (ttl=%d days, unique share id)", SHARE_TTL_DAYS
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not create indexes: %s", exc)


@app.on_event("shutdown")
async def _close_mongo() -> None:
    mongo_client.close()


# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------
@api_router.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok", "service": "MovieAI", "version": "1.3.0"}


@api_router.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "model_loaded": ml_service.model is not None,
        "rows": int(len(ml_service.imdb)),
    }


def _do_predict(p: PredictRequest) -> dict[str, object]:
    res = ml_service.predict(
        year=p.year,
        votes=p.votes,
        duration=float(p.duration),
        genre=p.genre,
        director=p.director,
        actor1=p.actor1,
        actor2=p.actor2,
        actor3=p.actor3,
    )
    res["movie_name"] = p.name
    return res


@api_router.post("/predict")
async def predict(payload: PredictRequest) -> dict[str, object]:
    try:
        return _do_predict(payload)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@api_router.post("/compare")
async def compare(payload: CompareRequest) -> dict[str, object]:
    """Predict two movies in one round-trip and pick a winner."""
    try:
        a = _do_predict(payload.movie_a)
        b = _do_predict(payload.movie_b)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Comparison failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    diff = round(a["predicted_rating"] - b["predicted_rating"], 2)
    if diff > 0.05:
        winner = "a"
    elif diff < -0.05:
        winner = "b"
    else:
        winner = "tie"

    return {
        "movie_a": {**a, "input": payload.movie_a.model_dump()},
        "movie_b": {**b, "input": payload.movie_b.model_dump()},
        "diff": diff,
        "winner": winner,
    }


@api_router.post("/sentiment")
async def sentiment(payload: SentimentRequest) -> dict[str, object]:
    return ml_service.sentiment(payload.review)


@api_router.post("/final-rating")
async def final_rating(payload: FinalRatingRequest) -> dict[str, object]:
    return ml_service.final_rating(payload.predicted_rating, payload.review)


@api_router.get("/analytics")
async def analytics() -> dict[str, object]:
    return ml_service.analytics()


@api_router.get("/suggestions")
async def suggestions(
    field: str = Query(..., pattern="^(genre|director|actor1|actor2|actor3)$"),
    q: str = Query(default=""),
    limit: int = Query(default=8, ge=1, le=25),
) -> dict[str, object]:
    return {"field": field, "results": ml_service.suggestions(field, q, limit)}


@api_router.get("/model-info")
async def model_info() -> dict[str, object]:
    df = ml_service.imdb
    feature_cols = [
        "Year",
        "Votes",
        "Duration",
        "Genre_mean_rating",
        "Director_encoded",
        "Actor1_encoded",
        "Actor2_encoded",
        "Actor3_encoded",
    ]
    return {
        "metrics": ml_service.metrics,
        "feature_columns": feature_cols,
        "feature_importances": {
            name: float(imp)
            for name, imp in zip(
                feature_cols,
                (
                    ml_service.model.feature_importances_.tolist()
                    if ml_service.model
                    else []
                ),
            )
        },
        "dataset_size": int(len(df)),
        "unique_movies": int(df["Name"].nunique()),
        "unique_genres": int(df["Genre"].nunique()),
        "unique_directors": int(df["Director"].nunique()),
        "global_mean_rating": round(float(ml_service.global_mean_rating), 3),
    }


# ---------------------------------------------------------------------
# Predictions: save & retrieve for sharing
# ---------------------------------------------------------------------
def _short_id() -> str:
    return uuid.uuid4().hex[:10]


@api_router.post("/predictions/share")
@limiter.limit("10/minute")
async def share_prediction(
    request: Request,
    payload: Annotated[SharePredictionRequest, Body()],
) -> dict[str, object]:
    now = datetime.now(timezone.utc)
    share_id = _short_id()
    doc = {
        "id": share_id,
        "input": payload.input.model_dump(),
        "result": payload.result.model_dump(),
        "review": payload.review,
        "final": payload.final.model_dump() if payload.final else None,
        "created_at": now.isoformat(),
        # MongoDB TTL works on real BSON datetimes.
        "expires_at": now.replace(microsecond=0) + timedelta(days=SHARE_TTL_DAYS),
    }
    await predictions_col.insert_one(doc)
    return {"id": share_id, "ttl_days": SHARE_TTL_DAYS}


@api_router.get("/predictions/{share_id}")
async def get_prediction(share_id: str) -> dict[str, object]:
    doc = await predictions_col.find_one(
        {"id": share_id}, {"_id": 0, "expires_at": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return doc


@api_router.get("/predictions")
async def list_predictions(limit: int = Query(default=20, ge=1, le=100)) -> dict:
    cursor = (
        predictions_col.find({}, {"_id": 0, "expires_at": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    items = await cursor.to_list(length=limit)
    return {"items": items, "count": len(items)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
