from app.utils.text_matcher import TextMatcher


def main():
    # 1. Initialize the TextMatcher
    matcher = TextMatcher()

    # 2. Fit with reference documents (e.g., job descriptions)
    job_descriptions = [
        "Machine Learning Engineer: Experience with Python, TensorFlow, and scikit-learn. Build and deploy ML models.",
        "Full Stack Developer: Proficient in React, Node.js, and PostgreSQL. Build web applications from end to end.",
        "Data Scientist: Skilled in pandas, numpy, and statistical modeling. Analyze data and build predictive models.",
        "UI/UX Designer: Expertise in Figma, user research, and design systems. Create beautiful, usable interfaces."
    ]
    matcher.fit(job_descriptions)
    print("TextMatcher fitted successfully!")

    # 3. Match a query against reference texts
    query = "Python developer with machine learning experience"
    results = matcher.match(query, top_k=3)
    
    print(f"\nQuery: {query}")
    print("Top matches:")
    for idx, score, text in results:
        print(f"  [{idx}] Score: {score:.2f}")
        print(f"  {text}\n")

    # 4. Calculate similarity between two arbitrary texts
    text1 = "Machine learning with Python"
    text2 = "Python for machine learning"
    similarity = matcher.similarity(text1, text2)
    print(f"Similarity between '{text1}' and '{text2}': {similarity:.2f}")

    # 5. Save and load the matcher
    matcher.save("text_matcher.joblib")
    print("\nTextMatcher saved to text_matcher.joblib")

    loaded_matcher = TextMatcher.load("text_matcher.joblib")
    print("TextMatcher loaded successfully!")
    new_results = loaded_matcher.match("React and Node.js", top_k=1)
    print(f"Top match from loaded matcher: {new_results[0][2]}")


if __name__ == "__main__":
    main()
