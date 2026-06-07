# TextMatcher: Lightweight Semantic Matching

## Overview
TextMatcher is a lightweight, memory-efficient alternative to Sentence Transformers, built using scikit-learn's TF-IDF vectorization and cosine similarity. It's designed for deployment in constrained environments with limited storage (512 MB or less).

## Key Features
- **No heavy dependencies**: No PyTorch, no Sentence Transformers, no transformers, no CUDA
- **Memory efficient**: Optimized for small Docker containers and free tiers like Render and Railway
- **Production-ready**: With type hints, docstrings, and graceful error handling
- **Save/load functionality**: Uses joblib for persistence

## Accuracy Tradeoffs Compared to Sentence Transformers

### Advantages
1. **Much smaller footprint**: No multi-hundred-MB model downloads
2. **Faster startup time**: No model loading overhead
3. **Works offline**: No external model dependencies
4. **Better for exact phrase matching**: Good for keyword-heavy domains like technical skills

### Limitations
1. **No semantic understanding**: TF-IDF matches based on word overlap, not meaning
   - Example: "machine learning" and "ML" will have low similarity
   - Example: "software engineer" and "developer" won't match as well as with embeddings
2. **No context awareness**: Doesn't understand word order or nuance
3. **Limited to vocabulary in training data**: Can't generalize to unseen terms
4. **Poor for paraphrases**: Sentences with the same meaning but different wording won't match well

### When This Approach May Fail
- When you need to match paraphrased content
- When domain-specific jargon has multiple synonyms
- When semantic similarity is more important than keyword overlap
- When matching abstract concepts rather than concrete terms

## Usage
See `example_usage.py` for complete examples.
