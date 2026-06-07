"""
TextMatcher — lightweight TF-IDF cosine similarity matcher.

Drop-in replacement for sentence-transformers that works in 512 MB
constrained environments (Render free tier, Railway, small Docker).
No torch, no CUDA, no GPU drivers required.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import List, Tuple

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class TextMatcher:
    """
    Semantic text matcher built on TF-IDF vectors and cosine similarity.

    Suitable for resume-vs-job-description matching, FAQ retrieval, and
    any task requiring approximate text similarity without deep learning.

    Parameters
    ----------
    ngram_range : tuple, default (1, 2)
        Unigrams and bigrams capture short multi-word phrases such as
        "machine learning" or "project management".
    max_features : int, default 20_000
        Vocabulary cap keeps memory usage bounded on constrained hosts.
    sublinear_tf : bool, default True
        Apply log(1 + tf) scaling — reduces the dominance of very
        frequent terms and improves matching quality on short texts.
    """

    def __init__(
        self,
        ngram_range: Tuple[int, int] = (1, 2),
        max_features: int = 20_000,
        sublinear_tf: bool = True,
    ) -> None:
        self._vectorizer = TfidfVectorizer(
            ngram_range=ngram_range,
            max_features=max_features,
            sublinear_tf=sublinear_tf,
            lowercase=True,
            stop_words="english",
            strip_accents="unicode",
            analyzer="word",
        )
        self._matrix = None          # sparse TF-IDF matrix of reference docs
        self._reference_texts: List[str] = []
        self._fitted = False

    # ── Public API ────────────────────────────────────────────────────────────

    def fit(self, texts: List[str]) -> "TextMatcher":
        """
        Build the TF-IDF vocabulary and index from *texts*.

        Parameters
        ----------
        texts : list of str
            Reference corpus (e.g. job descriptions, requirements).

        Returns
        -------
        self : TextMatcher
            Enables method chaining: ``matcher.fit(docs).match(query)``.

        Raises
        ------
        ValueError
            If *texts* is empty or contains only blank strings.
        """
        clean = [t.strip() for t in texts if t and t.strip()]
        if not clean:
            raise ValueError("fit() requires at least one non-empty string.")

        self._reference_texts = clean
        self._matrix = self._vectorizer.fit_transform(clean)
        self._fitted = True
        logger.debug("TextMatcher fitted on %d documents.", len(clean))
        return self

    def match(
        self,
        query: str,
        top_k: int = 5,
    ) -> List[Tuple[int, float, str]]:
        """
        Find the *top_k* most similar reference texts for *query*.

        Parameters
        ----------
        query : str
            The text to compare against the reference corpus.
        top_k : int, default 5
            Maximum number of results to return.

        Returns
        -------
        list of (index, score, text) tuples
            Sorted by descending similarity score.
            *score* is a float in [0.0, 1.0].

        Raises
        ------
        RuntimeError
            If called before :meth:`fit`.
        """
        self._require_fitted()
        if not query or not query.strip():
            logger.warning("match() called with empty query — returning empty list.")
            return []

        query_vec = self._vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self._matrix).flatten()

        # argsort ascending → take last top_k and reverse for descending order
        top_indices = scores.argsort()[-top_k:][::-1]

        return [
            (int(idx), float(scores[idx]), self._reference_texts[idx])
            for idx in top_indices
            if scores[idx] > 0.0          # omit zero-similarity results
        ]

    def similarity(self, text_a: str, text_b: str) -> float:
        """
        Return cosine similarity between two arbitrary texts (0.0 – 1.0).

        Does NOT require :meth:`fit` to have been called first — fits a
        temporary vectorizer on the two texts.

        Parameters
        ----------
        text_a : str
        text_b : str

        Returns
        -------
        float
            Similarity score in [0.0, 1.0].
        """
        if not text_a or not text_b:
            return 0.0
        try:
            tmp = TfidfVectorizer(
                ngram_range=self._vectorizer.ngram_range,
                sublinear_tf=True,
                lowercase=True,
                stop_words="english",
            )
            vecs = tmp.fit_transform([text_a, text_b])
            return float(cosine_similarity(vecs[0], vecs[1]).flat[0])
        except Exception:
            return 0.0

    def save(self, path: str | Path) -> None:
        """
        Persist the fitted vectorizer and reference matrix to *path*.

        Parameters
        ----------
        path : str or Path
            File path (e.g. ``/tmp/matcher.joblib``).

        Raises
        ------
        RuntimeError
            If the matcher has not been fitted yet.
        """
        self._require_fitted()
        payload = {
            "vectorizer": self._vectorizer,
            "matrix": self._matrix,
            "texts": self._reference_texts,
        }
        joblib.dump(payload, path, compress=3)
        logger.info("TextMatcher saved to %s", path)

    @classmethod
    def load(cls, path: str | Path) -> "TextMatcher":
        """
        Load a previously saved TextMatcher from *path*.

        Parameters
        ----------
        path : str or Path

        Returns
        -------
        TextMatcher
            A ready-to-use fitted instance.
        """
        payload = joblib.load(path)
        instance = cls()
        instance._vectorizer = payload["vectorizer"]
        instance._matrix = payload["matrix"]
        instance._reference_texts = payload["texts"]
        instance._fitted = True
        logger.info("TextMatcher loaded from %s", path)
        return instance

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _require_fitted(self) -> None:
        if not self._fitted:
            raise RuntimeError(
                "TextMatcher is not fitted. Call fit(texts) first."
            )

    def __repr__(self) -> str:
        status = f"{len(self._reference_texts)} docs" if self._fitted else "unfitted"
        return f"TextMatcher(ngram_range={self._vectorizer.ngram_range}, status={status})"
