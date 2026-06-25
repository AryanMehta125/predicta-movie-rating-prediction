"""Backend tests for prediction share endpoints (P2)."""
from __future__ import annotations

import os
import re

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
SHORT_ID_RE = re.compile(r"^[0-9a-f]{10}$")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def sample_payload():
    return {
        "input": {
            "name": "TEST_ShareMovie",
            "year": 2021,
            "votes": 9000,
            "duration": 130,
            "genre": "Drama",
            "director": "Rajkumar Hirani",
            "actor1": "Aamir Khan",
            "actor2": "Madhavan",
            "actor3": "Sharman Joshi",
        },
        "result": {
            "predicted_rating": 7.42,
            "confidence": 88.5,
            "impacts": {"director": 0.5, "genre": 0.2, "cast": 0.4, "votes": 0.6},
            "features_used": {"year": 2021},
            "feature_importances": {"Year": 0.1},
            "global_mean_rating": 5.85,
        },
        "review": "Loved it",
        "final": {"final_rating": 7.6, "predicted_rating": 7.42, "adjustment": 0.18,
                  "sentiment": {"polarity": 0.12, "subjectivity": 0.4,
                                "label": "Positive", "confidence": 42.0,
                                "adjustment": 0.18}},
    }


class TestShareCreate:
    def test_share_returns_short_hex_id(self, client, sample_payload):
        r = client.post(f"{API}/predictions/share", json=sample_payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data
        assert SHORT_ID_RE.match(data["id"]), f"id {data['id']} not 10-char hex"

    def test_share_minimal_payload(self, client, sample_payload):
        # Strict schema: final is optional but input + result are required.
        minimal = {"input": sample_payload["input"], "result": sample_payload["result"]}
        r = client.post(
            f"{API}/predictions/share",
            json=minimal,
            timeout=15,
        )
        assert r.status_code == 200
        assert SHORT_ID_RE.match(r.json()["id"])

    def test_share_missing_required_fields(self, client):
        r = client.post(f"{API}/predictions/share", json={"input": {}}, timeout=15)
        # result is required
        assert r.status_code == 422


class TestShareRetrieve:
    def test_create_then_get_round_trip(self, client, sample_payload):
        # Create
        r = client.post(f"{API}/predictions/share", json=sample_payload, timeout=15)
        assert r.status_code == 200
        share_id = r.json()["id"]

        # Get
        r2 = client.get(f"{API}/predictions/{share_id}", timeout=15)
        assert r2.status_code == 200, r2.text
        doc = r2.json()
        assert doc["id"] == share_id
        assert doc["input"]["name"] == sample_payload["input"]["name"]
        assert doc["input"]["year"] == sample_payload["input"]["year"]
        assert doc["result"]["predicted_rating"] == sample_payload["result"]["predicted_rating"]
        assert doc["review"] == sample_payload["review"]
        assert doc["final"]["final_rating"] == sample_payload["final"]["final_rating"]
        assert "created_at" in doc
        # MongoDB ObjectId should NOT be returned
        assert "_id" not in doc

    def test_get_unknown_id_returns_404(self, client):
        r = client.get(f"{API}/predictions/notarealid12", timeout=15)
        assert r.status_code == 404
        body = r.json()
        assert "detail" in body

    def test_list_predictions(self, client, sample_payload):
        # Insert one to ensure list isn't empty
        client.post(f"{API}/predictions/share", json=sample_payload, timeout=15)
        r = client.get(f"{API}/predictions", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and "count" in data
        assert isinstance(data["items"], list)
        assert data["count"] >= 1
        # No mongo _id leaked
        for item in data["items"]:
            assert "_id" not in item


class TestSharedIdsAreUnique:
    def test_two_shares_have_distinct_ids(self, client, sample_payload):
        ids = set()
        for _ in range(3):
            r = client.post(f"{API}/predictions/share", json=sample_payload, timeout=15)
            assert r.status_code == 200
            ids.add(r.json()["id"])
        assert len(ids) == 3, "expected unique ids for each call"


class TestHealthAfterRestart:
    """P1: joblib cache should make /api/health respond quickly with model_loaded."""

    def test_health_ok(self, client):
        r = client.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["model_loaded"] is True
        assert data["rows"] > 0
