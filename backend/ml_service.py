"""ML service that reuses the original Random Forest + TextBlob workflow.

Loads the IMDb India dataset once at import-time, performs the same
pre-processing and feature-engineering as the original Streamlit
`Final.py`, trains a RandomForestRegressor in memory and exposes helper
functions for prediction, sentiment, final rating combination and
aggregated analytics.

The trained model + lookup tables are cached to disk with joblib so that
subsequent backend restarts skip the ~5 second retrain (P1).
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from textblob import TextBlob

logger = logging.getLogger(__name__)

DATA_PATH = Path(__file__).parent / "data" / "IMDb_Movies_India.csv"
CACHE_PATH = Path(__file__).parent / "data" / "model_cache.joblib"
CACHE_VERSION = 2  # bump to invalidate stale caches

FEATURE_COLS = [
    "Year",
    "Votes",
    "Duration",
    "Genre_mean_rating",
    "Director_encoded",
    "Actor1_encoded",
    "Actor2_encoded",
    "Actor3_encoded",
]


class MovieRatingService:
    """Encapsulates dataset, mean-encoders and trained Random Forest model."""

    def __init__(self, data_path: Path = DATA_PATH) -> None:
        self.data_path = data_path
        self.imdb: pd.DataFrame = pd.DataFrame()
        self.model: RandomForestRegressor | None = None
        self.lr_model: LinearRegression | None = None
        self.genre_mean: pd.Series = pd.Series(dtype=float)
        self.director_mean: pd.Series = pd.Series(dtype=float)
        self.actor1_mean: pd.Series = pd.Series(dtype=float)
        self.actor2_mean: pd.Series = pd.Series(dtype=float)
        self.actor3_mean: pd.Series = pd.Series(dtype=float)
        self.global_mean_rating: float = 0.0
        self.metrics: dict[str, float] = {}

        if not self._load_cache():
            self._load_and_train()
            self._save_cache()

    # ------------------------------------------------------------------
    # Joblib cache
    # ------------------------------------------------------------------
    def _load_cache(self) -> bool:
        if not CACHE_PATH.exists():
            return False
        try:
            data_mtime = self.data_path.stat().st_mtime
            cache_mtime = CACHE_PATH.stat().st_mtime
            if cache_mtime < data_mtime:
                logger.info("Cache is older than dataset, rebuilding.")
                return False
            payload = joblib.load(CACHE_PATH)
            if payload.get("version") != CACHE_VERSION:
                logger.info("Cache version mismatch, rebuilding.")
                return False
            self.imdb = payload["imdb"]
            self.model = payload["model"]
            self.lr_model = payload["lr_model"]
            self.genre_mean = payload["genre_mean"]
            self.director_mean = payload["director_mean"]
            self.actor1_mean = payload["actor1_mean"]
            self.actor2_mean = payload["actor2_mean"]
            self.actor3_mean = payload["actor3_mean"]
            self.global_mean_rating = payload["global_mean_rating"]
            self.metrics = payload["metrics"]
            logger.info(
                "Loaded model from cache (rows=%d, RF R²=%.4f)",
                len(self.imdb),
                self.metrics.get("rf_r2", 0.0),
            )
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to load cache: %s — retraining.", exc)
            return False

    def _save_cache(self) -> None:
        try:
            CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(
                {
                    "version": CACHE_VERSION,
                    "imdb": self.imdb,
                    "model": self.model,
                    "lr_model": self.lr_model,
                    "genre_mean": self.genre_mean,
                    "director_mean": self.director_mean,
                    "actor1_mean": self.actor1_mean,
                    "actor2_mean": self.actor2_mean,
                    "actor3_mean": self.actor3_mean,
                    "global_mean_rating": self.global_mean_rating,
                    "metrics": self.metrics,
                },
                CACHE_PATH,
                compress=3,
            )
            logger.info("Model cached to %s", CACHE_PATH)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not write cache: %s", exc)

    # ------------------------------------------------------------------
    # Data loading + training (mirrors Final.py pre-processing)
    # ------------------------------------------------------------------
    def _load_and_train(self) -> None:
        logger.info("Loading dataset from %s", self.data_path)
        imdb = pd.read_csv(self.data_path, encoding="latin-1")

        # Drop rows with nulls in essential columns (same as original).
        imdb.dropna(
            subset=[
                "Name",
                "Year",
                "Duration",
                "Rating",
                "Votes",
                "Director",
                "Actor 1",
                "Actor 2",
                "Actor 3",
            ],
            inplace=True,
        )

        # Clean Name (text part only)
        imdb["Name"] = imdb["Name"].astype(str).str.extract(r"([0-9A-Za-z\s\'\-]+)")[0]

        # Strip () from Year and cast to int
        imdb["Year"] = imdb["Year"].astype(str).str.replace(r"[()]", "", regex=True)
        imdb["Year"] = pd.to_numeric(imdb["Year"], errors="coerce")
        imdb.dropna(subset=["Year"], inplace=True)
        imdb["Year"] = imdb["Year"].astype(int)

        # Duration -> numeric (strip " min")
        imdb["Duration"] = pd.to_numeric(
            imdb["Duration"].astype(str).str.replace(r" min", "", regex=True),
            errors="coerce",
        )
        imdb.dropna(subset=["Duration"], inplace=True)

        # Explode genre on ", " and fill na with mode (same as original)
        imdb["Genre"] = imdb["Genre"].astype(str).str.split(", ")
        imdb = imdb.explode("Genre")
        if imdb["Genre"].isna().any():
            imdb["Genre"] = imdb["Genre"].fillna(imdb["Genre"].mode()[0])

        # Votes -> numeric (strip ",")
        imdb["Votes"] = pd.to_numeric(
            imdb["Votes"].astype(str).str.replace(",", ""), errors="coerce"
        )
        imdb.dropna(subset=["Votes"], inplace=True)

        # Drop duplicates by Name (kept here to match Final.py)
        imdb = imdb.drop_duplicates(subset=["Name"])

        # Mean-encoded engineered features
        imdb["Genre_mean_rating"] = imdb.groupby("Genre")["Rating"].transform("mean")
        imdb["Director_encoded"] = imdb.groupby("Director")["Rating"].transform("mean")
        imdb["Actor1_encoded"] = imdb.groupby("Actor 1")["Rating"].transform("mean")
        imdb["Actor2_encoded"] = imdb.groupby("Actor 2")["Rating"].transform("mean")
        imdb["Actor3_encoded"] = imdb.groupby("Actor 3")["Rating"].transform("mean")

        # Safety net — drop any remaining NaNs from feature columns
        imdb.dropna(subset=FEATURE_COLS + ["Rating"], inplace=True)

        self.imdb = imdb.reset_index(drop=True)
        self.global_mean_rating = float(self.imdb["Rating"].mean())

        # Lookup encoders for prediction time
        self.genre_mean = self.imdb.groupby("Genre")["Rating"].mean()
        self.director_mean = self.imdb.groupby("Director")["Rating"].mean()
        self.actor1_mean = self.imdb.groupby("Actor 1")["Rating"].mean()
        self.actor2_mean = self.imdb.groupby("Actor 2")["Rating"].mean()
        self.actor3_mean = self.imdb.groupby("Actor 3")["Rating"].mean()

        X = self.imdb[FEATURE_COLS]
        y = self.imdb["Rating"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train both models (Linear Regression for comparison, Random Forest used for prediction)
        lr = LinearRegression()
        lr.fit(X_train, y_train)
        lr_pred = lr.predict(X_test)

        rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        rf.fit(X_train, y_train)
        rf_pred = rf.predict(X_test)

        self.lr_model = lr
        self.model = rf

        self.metrics = {
            "rf_mse": float(mean_squared_error(y_test, rf_pred)),
            "rf_mae": float(mean_absolute_error(y_test, rf_pred)),
            "rf_r2": float(r2_score(y_test, rf_pred)),
            "lr_mse": float(mean_squared_error(y_test, lr_pred)),
            "lr_mae": float(mean_absolute_error(y_test, lr_pred)),
            "lr_r2": float(r2_score(y_test, lr_pred)),
            "n_training_rows": int(len(X_train)),
            "n_test_rows": int(len(X_test)),
        }

        logger.info("Model trained. RF R2=%.4f MAE=%.4f", self.metrics["rf_r2"], self.metrics["rf_mae"])

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------
    def _lookup(self, series: pd.Series, key: str | None) -> float:
        """Return mean rating for a categorical key, falling back to global mean."""
        if key is None:
            return self.global_mean_rating
        # Case-insensitive lookup attempt for better UX
        if key in series.index:
            return float(series.loc[key])
        lowered = {str(k).lower(): k for k in series.index}
        if key.lower() in lowered:
            return float(series.loc[lowered[key.lower()]])
        return self.global_mean_rating

    def predict(
        self,
        year: int,
        votes: int,
        duration: float,
        genre: str,
        director: str,
        actor1: str,
        actor2: str,
        actor3: str,
    ) -> dict[str, Any]:
        if self.model is None:
            raise RuntimeError("Model is not trained yet.")

        genre_rating = self._lookup(self.genre_mean, genre)
        director_rating = self._lookup(self.director_mean, director)
        actor1_rating = self._lookup(self.actor1_mean, actor1)
        actor2_rating = self._lookup(self.actor2_mean, actor2)
        actor3_rating = self._lookup(self.actor3_mean, actor3)

        features = pd.DataFrame(
            {
                "Year": [year],
                "Votes": [votes],
                "Duration": [duration],
                "Genre_mean_rating": [genre_rating],
                "Director_encoded": [director_rating],
                "Actor1_encoded": [actor1_rating],
                "Actor2_encoded": [actor2_rating],
                "Actor3_encoded": [actor3_rating],
            }
        )

        predicted = float(self.model.predict(features)[0])
        predicted = max(0.0, min(10.0, predicted))

        # Tree-based confidence: std across estimators (lower = more confident)
        tree_preds = np.array([t.predict(features)[0] for t in self.model.estimators_])
        std = float(tree_preds.std())
        # Convert std to a 0-100 confidence (clip std to [0, 2])
        confidence = float(max(0.0, min(100.0, 100.0 - (std / 2.0) * 100.0)))

        # Per-feature deltas vs. global mean (rough impact attribution)
        impacts = {
            "director": round(director_rating - self.global_mean_rating, 3),
            "genre": round(genre_rating - self.global_mean_rating, 3),
            "cast": round(
                ((actor1_rating + actor2_rating + actor3_rating) / 3.0)
                - self.global_mean_rating,
                3,
            ),
            "votes": round(float(np.log1p(votes) / 15.0), 3),  # logarithmic vote weight
        }

        # Feature importances from RF
        importances = dict(zip(FEATURE_COLS, self.model.feature_importances_.tolist()))

        return {
            "predicted_rating": round(predicted, 2),
            "confidence": round(confidence, 1),
            "std": round(std, 3),
            "impacts": impacts,
            "features_used": {
                "year": year,
                "votes": votes,
                "duration": duration,
                "genre_mean_rating": round(genre_rating, 3),
                "director_encoded": round(director_rating, 3),
                "actor1_encoded": round(actor1_rating, 3),
                "actor2_encoded": round(actor2_rating, 3),
                "actor3_encoded": round(actor3_rating, 3),
            },
            "feature_importances": {k: round(v, 4) for k, v in importances.items()},
            "global_mean_rating": round(self.global_mean_rating, 3),
        }

    def sentiment(self, review: str) -> dict[str, Any]:
        blob = TextBlob(review or "")
        polarity = float(blob.sentiment.polarity)
        subjectivity = float(blob.sentiment.subjectivity)

        if polarity > 0.15:
            label = "Positive"
        elif polarity < -0.15:
            label = "Negative"
        else:
            label = "Neutral"

        # Confidence based on absolute polarity * subjectivity bias
        confidence = float(min(100.0, abs(polarity) * 100.0 + 30.0))
        if label == "Neutral":
            confidence = float(min(100.0, (1.0 - abs(polarity)) * 80.0))

        return {
            "polarity": round(polarity, 4),
            "subjectivity": round(subjectivity, 4),
            "label": label,
            "confidence": round(confidence, 1),
            "adjustment": round(polarity * 1.5, 4),
        }

    def final_rating(
        self,
        predicted_rating: float,
        review: str | None,
    ) -> dict[str, Any]:
        sentiment_info = self.sentiment(review or "")
        adjustment = sentiment_info["adjustment"] if review and review.strip() else 0.0
        final = predicted_rating + adjustment
        final = max(0.0, min(10.0, final))

        return {
            "predicted_rating": round(float(predicted_rating), 2),
            "sentiment": sentiment_info,
            "adjustment": round(float(adjustment), 4),
            "final_rating": round(float(final), 2),
        }

    # ------------------------------------------------------------------
    # Analytics
    # ------------------------------------------------------------------
    def analytics(self) -> dict[str, Any]:
        df = self.imdb

        # Rating distribution (0.5 bins from 0-10)
        bins = np.arange(0, 10.5, 0.5)
        hist, edges = np.histogram(df["Rating"], bins=bins)
        rating_distribution = [
            {"bin": f"{edges[i]:.1f}", "count": int(hist[i])}
            for i in range(len(hist))
        ]

        # Top genres by avg rating (min 30 movies)
        genre_grp = (
            df.groupby("Genre")
            .agg(avg_rating=("Rating", "mean"), count=("Rating", "size"))
            .reset_index()
        )
        genre_grp = genre_grp[genre_grp["count"] >= 30].sort_values(
            "avg_rating", ascending=False
        )
        genre_performance = [
            {
                "genre": str(row["Genre"]),
                "avg_rating": round(float(row["avg_rating"]), 2),
                "count": int(row["count"]),
            }
            for _, row in genre_grp.head(12).iterrows()
        ]

        # Top directors
        director_grp = (
            df.groupby("Director")
            .agg(avg_rating=("Rating", "mean"), count=("Rating", "size"))
            .reset_index()
        )
        director_grp = director_grp[director_grp["count"] >= 5].sort_values(
            "avg_rating", ascending=False
        )
        director_performance = [
            {
                "director": str(row["Director"]),
                "avg_rating": round(float(row["avg_rating"]), 2),
                "count": int(row["count"]),
            }
            for _, row in director_grp.head(10).iterrows()
        ]

        # Top actors (Actor 1)
        actor_grp = (
            df.groupby("Actor 1")
            .agg(avg_rating=("Rating", "mean"), count=("Rating", "size"))
            .reset_index()
        )
        actor_grp = actor_grp[actor_grp["count"] >= 5].sort_values(
            "avg_rating", ascending=False
        )
        actor_performance = [
            {
                "actor": str(row["Actor 1"]),
                "avg_rating": round(float(row["avg_rating"]), 2),
                "count": int(row["count"]),
            }
            for _, row in actor_grp.head(10).iterrows()
        ]

        # Votes distribution buckets (log-friendly)
        vote_bins = [0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1_000_000]
        vote_labels = [
            "<100",
            "100-500",
            "500-1k",
            "1k-5k",
            "5k-10k",
            "10k-50k",
            "50k-100k",
            "100k+",
        ]
        df_v = df.copy()
        df_v["VoteBucket"] = pd.cut(
            df_v["Votes"], bins=vote_bins, labels=vote_labels, include_lowest=True
        )
        vote_grp = df_v.groupby("VoteBucket", observed=True).size().reindex(vote_labels, fill_value=0)
        vote_distribution = [
            {"bucket": str(label), "count": int(count)}
            for label, count in vote_grp.items()
        ]

        # Year trends - avg rating + count per decade for cleaner chart
        year_grp = (
            df.groupby("Year")
            .agg(avg_rating=("Rating", "mean"), count=("Rating", "size"))
            .reset_index()
            .sort_values("Year")
        )
        # Restrict to a reasonable range
        year_grp = year_grp[(year_grp["Year"] >= 1950) & (year_grp["Year"] <= 2025)]
        year_trends = [
            {
                "year": int(row["Year"]),
                "avg_rating": round(float(row["avg_rating"]), 2),
                "count": int(row["count"]),
            }
            for _, row in year_grp.iterrows()
        ]

        # Headline stats
        stats = {
            "total_movies": int(df["Name"].nunique()),
            "total_rows": int(len(df)),
            "avg_rating": round(float(df["Rating"].mean()), 2),
            "median_rating": round(float(df["Rating"].median()), 2),
            "total_directors": int(df["Director"].nunique()),
            "total_actors": int(
                pd.concat([df["Actor 1"], df["Actor 2"], df["Actor 3"]]).nunique()
            ),
            "total_genres": int(df["Genre"].nunique()),
            "highest_rated_genre": (
                genre_performance[0]["genre"] if genre_performance else None
            ),
            "highest_rated_director": (
                director_performance[0]["director"] if director_performance else None
            ),
            "highest_rated_actor": (
                actor_performance[0]["actor"] if actor_performance else None
            ),
            "total_votes": int(df["Votes"].sum()),
        }

        return {
            "stats": stats,
            "rating_distribution": rating_distribution,
            "genre_performance": genre_performance,
            "director_performance": director_performance,
            "actor_performance": actor_performance,
            "vote_distribution": vote_distribution,
            "year_trends": year_trends,
            "metrics": self.metrics,
        }

    # ------------------------------------------------------------------
    # Autocomplete suggestions
    # ------------------------------------------------------------------
    def suggestions(self, field: str, q: str = "", limit: int = 8) -> list[str]:
        mapping = {
            "genre": self.genre_mean.index,
            "director": self.director_mean.index,
            "actor1": self.actor1_mean.index,
            "actor2": self.actor2_mean.index,
            "actor3": self.actor3_mean.index,
        }
        index = mapping.get(field)
        if index is None:
            return []
        q = (q or "").strip().lower()
        if not q:
            return [str(v) for v in list(index)[:limit]]
        matches = [str(v) for v in index if q in str(v).lower()]
        return matches[:limit]


# Singleton instance — trained once when the module is imported.
ml_service = MovieRatingService()
