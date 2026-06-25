"""Backend regression tests for MovieAI API.

Covers:
- /api/health and /api/model-info smoke check
- /api/predict (success + validation errors)
- /api/sentiment (positive, negative, neutral, empty)
- /api/final-rating (combines predicted + sentiment)
- /api/analytics (shape + required keys)
- /api/suggestions (director, actor, genre)
"""
from __future__ import annotations

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Read from frontend/.env as fallback (test environment)
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------------- Health / Model Info ----------------
class TestHealth:
    def test_health(self, client):
        r = client.get(f"{API}/health", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok"
        assert data["model_loaded"] is True
        assert isinstance(data["rows"], int) and data["rows"] > 0

    def test_model_info(self, client):
        r = client.get(f"{API}/model-info", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "metrics" in data
        assert "rf_r2" in data["metrics"]
        assert "feature_importances" in data
        assert len(data["feature_importances"]) == 8
        assert data["dataset_size"] > 0
        assert data["unique_directors"] > 0


# ---------------- Predict ----------------
class TestPredict:
    VALID = {
        "name": "Test",
        "year": 2020,
        "votes": 5000,
        "duration": 120,
        "genre": "Drama",
        "director": "Rajkumar Hirani",
        "actor1": "Aamir Khan",
        "actor2": "Madhavan",
        "actor3": "Sharman Joshi",
    }

    def test_predict_valid(self, client):
        r = client.post(f"{API}/predict", json=self.VALID, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ("predicted_rating", "confidence", "impacts",
                    "feature_importances", "features_used"):
            assert key in data, f"missing key {key}"
        assert 0.0 <= data["predicted_rating"] <= 10.0
        assert 0.0 <= data["confidence"] <= 100.0
        assert set(data["impacts"].keys()) >= {"director", "genre", "cast", "votes"}

    def test_predict_missing_field(self, client):
        bad = {k: v for k, v in self.VALID.items() if k != "year"}
        r = client.post(f"{API}/predict", json=bad, timeout=30)
        assert r.status_code == 422

    def test_predict_out_of_range_year(self, client):
        bad = {**self.VALID, "year": 1500}
        r = client.post(f"{API}/predict", json=bad, timeout=30)
        assert r.status_code == 422

    def test_predict_unknown_categoricals_fallback(self, client):
        bad = {**self.VALID, "director": "ZZZ_Unknown",
               "actor1": "ZZZ_Unknown", "genre": "ZZZGenre"}
        r = client.post(f"{API}/predict", json=bad, timeout=30)
        assert r.status_code == 200
        assert 0.0 <= r.json()["predicted_rating"] <= 10.0


# ---------------- Sentiment ----------------
class TestSentiment:
    def test_sentiment_positive(self, client):
        r = client.post(f"{API}/sentiment",
                        json={"review": "Absolutely brilliant, fantastic movie!"},
                        timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["label"] == "Positive"
        assert data["polarity"] > 0

    def test_sentiment_negative(self, client):
        r = client.post(f"{API}/sentiment",
                        json={"review": "Terrible boring waste of time, horrible."},
                        timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["label"] == "Negative"
        assert data["polarity"] < 0

    def test_sentiment_neutral(self, client):
        r = client.post(f"{API}/sentiment",
                        json={"review": "The movie was released in 2020."},
                        timeout=15)
        assert r.status_code == 200
        assert r.json()["label"] in ("Neutral", "Positive", "Negative")

    def test_sentiment_empty_review_rejected(self, client):
        r = client.post(f"{API}/sentiment", json={"review": ""}, timeout=15)
        assert r.status_code == 422


# ---------------- Final Rating ----------------
class TestFinalRating:
    def test_final_rating_with_positive_review(self, client):
        r = client.post(f"{API}/final-rating",
                        json={"predicted_rating": 7.5,
                              "review": "Excellent direction and stellar acting!"},
                        timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert 0.0 <= data["final_rating"] <= 10.0
        assert data["predicted_rating"] == 7.5
        assert "sentiment" in data
        assert data["sentiment"]["label"] == "Positive"

    def test_final_rating_no_review(self, client):
        r = client.post(f"{API}/final-rating",
                        json={"predicted_rating": 6.0}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["final_rating"] == 6.0
        assert data["adjustment"] == 0.0

    def test_final_rating_clamped(self, client):
        r = client.post(f"{API}/final-rating",
                        json={"predicted_rating": 9.8,
                              "review": "Best masterpiece ever, perfect amazing!"},
                        timeout=15)
        assert r.status_code == 200
        assert r.json()["final_rating"] <= 10.0


# ---------------- Analytics ----------------
class TestAnalytics:
    def test_analytics_shape(self, client):
        r = client.get(f"{API}/analytics", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ("stats", "rating_distribution", "genre_performance",
                    "director_performance", "actor_performance",
                    "vote_distribution", "year_trends", "metrics"):
            assert key in data, f"missing {key}"
        assert isinstance(data["rating_distribution"], list) and len(data["rating_distribution"]) > 0
        assert isinstance(data["genre_performance"], list) and len(data["genre_performance"]) > 0
        assert "total_movies" in data["stats"]


# ---------------- Suggestions ----------------
class TestSuggestions:
    def test_suggestions_director(self, client):
        r = client.get(f"{API}/suggestions",
                       params={"field": "director", "q": "raj"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["field"] == "director"
        assert isinstance(data["results"], list)
        assert len(data["results"]) <= 8
        # should contain at least one director whose name has 'raj' (case insensitive)
        if data["results"]:
            assert any("raj" in s.lower() for s in data["results"])

    def test_suggestions_actor1(self, client):
        r = client.get(f"{API}/suggestions",
                       params={"field": "actor1", "q": "kha"}, timeout=15)
        assert r.status_code == 200
        assert len(r.json()["results"]) <= 8

    def test_suggestions_invalid_field(self, client):
        r = client.get(f"{API}/suggestions",
                       params={"field": "bad_field", "q": "x"}, timeout=15)
        assert r.status_code == 422
