import pytest
import tempfile
from pathlib import Path
from app.utils.text_matcher import TextMatcher


def test_fit_and_match():
    matcher = TextMatcher()
    texts = [
        "Machine learning engineer with experience in Python and TensorFlow",
        "Full stack developer proficient in React and Node.js",
        "Data scientist skilled in pandas, scikit-learn, and statistical modeling",
        "UI/UX designer with Figma and user research experience"
    ]
    matcher.fit(texts)
    results = matcher.match("Python and machine learning", top_k=2)
    assert len(results) > 0
    assert results[0][2] == texts[0]


def test_empty_query():
    matcher = TextMatcher()
    matcher.fit(["test text"])
    results = matcher.match("", top_k=5)
    assert len(results) == 0


def test_save_and_load():
    matcher = TextMatcher()
    texts = ["hello world", "foo bar"]
    matcher.fit(texts)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".joblib") as tmp:
        tmp_path = Path(tmp.name)
    
    try:
        matcher.save(tmp_path)
        loaded = TextMatcher.load(tmp_path)
        assert loaded._fitted
        assert loaded._reference_texts == texts
        
        results = loaded.match("hello", top_k=1)
        assert len(results) == 1
        assert results[0][2] == "hello world"
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def test_similarity():
    matcher = TextMatcher()
    score = matcher.similarity("Python machine learning", "Python machine learning")
    assert score > 0.99
    
    score = matcher.similarity("Python", "Java")
    assert score < 0.5


def test_fit_empty_texts():
    matcher = TextMatcher()
    with pytest.raises(ValueError):
        matcher.fit([])


def test_match_before_fit():
    matcher = TextMatcher()
    with pytest.raises(RuntimeError):
        matcher.match("test query")


def test_save_before_fit():
    matcher = TextMatcher()
    with tempfile.NamedTemporaryFile() as tmp:
        with pytest.raises(RuntimeError):
            matcher.save(tmp.name)
