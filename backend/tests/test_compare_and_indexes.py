"""Iteration-3 backend tests: /api/compare, strict /api/predictions/share schema, and Mongo indexes."""
from __future__ import annotations

import os
import asyncio

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break

API = f"{BASE_URL}/api"

MOVIE_A = {
    "name": "TEST_A",
    "year": 2020,
    "votes": 12000,
    "duration": 130,
    "genre": "Drama",
    "director": "Rajkumar Hirani",
    "actor1": "Aamir Khan",
    "actor2": "Madhavan",
    "actor3": "Sharman Joshi",
}
MOVIE_B = {
    "name": "TEST_B",
    "year": 2019,
    "votes": 4000,
    "duration": 110,
    "genre": "Comedy",
    "director": "Anurag Basu",
    "actor1": "Ranbir Kapoor",
    "actor2": "Priyanka Chopra",
    "actor3": "Ileana D'Cruz",
}


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------- /api/compare --------
class TestCompare:
    def test_compare_returns_winner_struct(self, client):
        r = client.post(f"{API}/compare",
                        json={"movie_a": MOVIE_A, "movie_b": MOVIE_B}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ("movie_a", "movie_b", "diff", "winner"):
            assert key in data, f"missing {key}"
        assert data["winner"] in ("a", "b", "tie")
        # Each side has prediction structure
        for side in ("movie_a", "movie_b"):
            assert "predicted_rating" in data[side]
            assert "confidence" in data[side]
            assert "impacts" in data[side]
            assert set(data[side]["impacts"].keys()) >= {
                "director", "genre", "cast", "votes"
            }
            assert "input" in data[side]
        # diff math
        diff = round(
            data["movie_a"]["predicted_rating"] - data["movie_b"]["predicted_rating"],
            2,
        )
        assert abs(diff - data["diff"]) < 0.05

    def test_compare_tie_for_same_movie(self, client):
        r = client.post(f"{API}/compare",
                        json={"movie_a": MOVIE_A, "movie_b": MOVIE_A}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["winner"] == "tie"
        assert abs(data["diff"]) < 0.05

    def test_compare_invalid_payload_422(self, client):
        bad = {"movie_a": MOVIE_A, "movie_b": {**MOVIE_B, "year": 1500}}
        r = client.post(f"{API}/compare", json=bad, timeout=15)
        assert r.status_code == 422

    def test_compare_missing_side_422(self, client):
        r = client.post(f"{API}/compare", json={"movie_a": MOVIE_A}, timeout=15)
        assert r.status_code == 422


# -------- Strict /api/predictions/share schema --------
def _valid_share_payload():
    return {
        "input": {**MOVIE_A},
        "result": {
            "predicted_rating": 7.3,
            "confidence": 88.0,
            "std": 0.5,
            "impacts": {"director": 0.5, "genre": 0.2, "cast": 0.3, "votes": 0.4},
            "features_used": {"year": 2020},
            "feature_importances": {"Year": 0.1},
            "global_mean_rating": 5.9,
            "movie_name": "TEST_A",
        },
        "review": "Solid work",
        "final": {
            "predicted_rating": 7.3,
            "adjustment": 0.2,
            "final_rating": 7.5,
            "sentiment": {
                "polarity": 0.4,
                "subjectivity": 0.5,
                "label": "Positive",
                "confidence": 80.0,
                "adjustment": 0.2,
            },
        },
    }


class TestShareStrictSchema:
    def test_valid_payload_returns_id_and_ttl(self, client):
        r = client.post(f"{API}/predictions/share",
                        json=_valid_share_payload(), timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and len(data["id"]) == 10
        assert data["ttl_days"] == 30

    def test_predicted_rating_out_of_range_422(self, client):
        p = _valid_share_payload()
        p["result"]["predicted_rating"] = 12.0  # > 10
        r = client.post(f"{API}/predictions/share", json=p, timeout=15)
        assert r.status_code == 422

    def test_missing_impacts_director_422(self, client):
        p = _valid_share_payload()
        del p["result"]["impacts"]["director"]
        r = client.post(f"{API}/predictions/share", json=p, timeout=15)
        assert r.status_code == 422

    def test_missing_result_field_422(self, client):
        p = _valid_share_payload()
        del p["result"]["predicted_rating"]
        r = client.post(f"{API}/predictions/share", json=p, timeout=15)
        assert r.status_code == 422

    def test_input_year_out_of_range_422(self, client):
        p = _valid_share_payload()
        p["input"]["year"] = 1800
        r = client.post(f"{API}/predictions/share", json=p, timeout=15)
        assert r.status_code == 422


# -------- Predictions GET: 404 + no expires_at field --------
class TestPredictionsGet:
    def test_get_excludes_expires_at(self, client):
        r = client.post(f"{API}/predictions/share",
                        json=_valid_share_payload(), timeout=15)
        share_id = r.json()["id"]
        g = client.get(f"{API}/predictions/{share_id}", timeout=15)
        assert g.status_code == 200
        doc = g.json()
        assert "expires_at" not in doc
        assert "_id" not in doc
        assert doc["id"] == share_id

    def test_get_unknown_returns_404(self, client):
        r = client.get(f"{API}/predictions/zzzzzzzzzz", timeout=10)
        assert r.status_code == 404


# -------- Mongo indexes: TTL + unique --------
class TestMongoIndexes:
    def test_ttl_and_unique_indexes_exist(self, client):
        # Make sure at least one document exists & indexes are ensured (startup ran).
        client.post(f"{API}/predictions/share",
                    json=_valid_share_payload(), timeout=15)

        from motor.motor_asyncio import AsyncIOMotorClient
        from pathlib import Path
        from dotenv import dotenv_values

        env = dotenv_values(Path("/app/backend/.env"))
        mongo_url = env["MONGO_URL"]
        db_name = env["DB_NAME"]

        async def fetch_indexes():
            cli = AsyncIOMotorClient(mongo_url)
            try:
                info = await cli[db_name]["predictions"].index_information()
                return info
            finally:
                cli.close()

        info = asyncio.get_event_loop().run_until_complete(fetch_indexes()) \
            if not asyncio.get_event_loop().is_running() else asyncio.new_event_loop().run_until_complete(fetch_indexes())

        # TTL index by name
        assert "ttl_expires_at" in info, f"indexes: {list(info.keys())}"
        ttl = info["ttl_expires_at"]
        assert ttl.get("expireAfterSeconds") == 0
        keys = ttl.get("key")
        # key looks like [('expires_at', 1)]
        assert any(k[0] == "expires_at" for k in keys)

        # Unique index on `id`
        assert "unique_share_id" in info, f"indexes: {list(info.keys())}"
        uniq = info["unique_share_id"]
        assert uniq.get("unique") is True
        assert any(k[0] == "id" for k in uniq.get("key", []))
