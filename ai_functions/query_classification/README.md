# Query Classification System

A comprehensive system for classifying intern queries as **generic** or **private**, with language appropriateness checking and automatic routing.

## Overview

This module helps manage intern queries by:

1. **Language Appropriateness Checking**: Detects and flags inappropriate language in queries
2. **Query Classification**: Categorizes queries as:
   - **Generic**: General questions covered by FAQ or community knowledge (routed to community forum)
   - **Private**: Personal/sensitive queries requiring individual attention (routed to admin)
   - **Inappropriate**: Queries with profanity or inappropriate language (dropped)
3. **Smart Routing**: Automatically routes queries to the appropriate destination

## Files

- **`query_classifier.py`**: Main classifier module with all core functionality
- **`new_queries_dataset.json`**: Dummy dataset of sample intern queries for testing
- **`utils.py`**: Helper functions and utilities
- **`README.md`**: This file

## Installation

No external dependencies required beyond Python standard library. The system uses:

- `json` - for data handling
- `re` - for pattern matching and language detection
- `os` and `pathlib` - for file operations

## Usage

### Basic Single Query Classification

```python
from query_classifier import QueryClassifier

# Initialize
classifier = QueryClassifier()

# Classify a query
query = "When can I start the internship?"
result = classifier.classify_query(query)

print(f"Classification: {result['classification']}")
print(f"Routing: {result['routing']}")
print(f"Confidence: {result['confidence']}")
```

### Batch Classification from Dataset

```python
# Classify all queries in a dataset
results = classifier.classify_from_dataset("new_queries_dataset.json")

# Generate routing report
report = classifier.generate_routing_report(results)

print(f"To Community: {report['routing_summary']['to_community']}")
print(f"To Admin: {report['routing_summary']['to_admin']}")
print(f"Dropped: {report['routing_summary']['dropped']}")
```

### Check Language Appropriateness

```python
query = "This is a stupid question!"
is_appropriate, flagged_words = classifier.check_language_appropriateness(query)

if not is_appropriate:
    print(f"Inappropriate words found: {flagged_words}")
```

## Query Classification Logic

### Routing Rules

Queries are routed based on the following logic:

```
1. Check Language Appropriateness
   ├─ If inappropriate → Drop (inappropriate_words flagged)
   └─ If appropriate → Continue to step 2

2. Check FAQ Similarity
   ├─ If high similarity (>0.3) → Consider generic
   └─ If low similarity → Consider private

3. Analyze Content for Private Indicators
   ├─ If contains: "personal", "medical", "family", "health", "financial", etc.
   │  → Mark as PRIVATE
   └─ Otherwise
      ├─ If good FAQ match → Mark as GENERIC (→ community)
      └─ If poor FAQ match → Mark as PRIVATE (→ admin)
```

### Classification Results

Each classification returns:

```json
{
  "query": "The original query text",
  "is_appropriate": true,
  "inappropriate_words": [],
  "classification": "generic|private|inappropriate",
  "confidence": 0.85,
  "matched_faq_ids": [
    {
      "faq_id": "1.6",
      "similarity": 0.65,
      "section": "About the internship"
    }
  ],
  "highest_similarity": 0.65,
  "routing": "community|admin|drop",
  "reason": "Explanation of classification decision"
}
```

## Dataset Format

### new_queries_dataset.json

Contains sample queries for testing the classifier:

```json
{
  "metadata": { ... },
  "queries": [
    {
      "id": "new_1",
      "query": "Query text here",
      "category": "generic|private|inappropriate",
      "reason": "Why this category applies"
    }
  ]
}
```

## Example Queries

### Generic Queries (→ Community)

- "Can I work on this internship while taking summer classes?"
- "How many hours per day should I be working?"
- "How do I access the Rosetta journal after completion?"

### Private Queries (→ Admin)

- "I have a medical condition that requires accommodation"
- "My college is not cooperating with the NOC"
- "I have another internship commitment during those dates"

### Inappropriate Queries (→ Drop)

- "This internship f\*\*\*ing sucks!"
- "I hate this sh\*t program"
- Queries with excessive profanity or offensive language

## Running the Example

```bash
python query_classifier.py
```

This will:

1. Show single query classification examples
2. Process the `new_queries_dataset.json`
3. Generate a classification summary
4. Save detailed results to `classification_results.json`

## Customization

### Adjust Similarity Threshold

```python
# Use a higher threshold for stricter "generic" classification
result = classifier.classify_query(query, similarity_threshold=0.5)
```

### Add Custom Inappropriate Words

```python
# Create a custom inappropriate words file
with open("inappropriate_words.txt", "w") as f:
    f.write("customword1\ncustomword2\n")

classifier = QueryClassifier(inappropriate_words_path="inappropriate_words.txt")
```

### Use Custom FAQ

```python
classifier = QueryClassifier(faq_path="/path/to/custom_faq.json")
```

## Output Files

When running batch classification:

- **`classification_results.json`**: Detailed classification results for all queries
  - Includes similarity scores, matched FAQs, confidence levels
  - Use for analysis and verification

## Integration Points

### In a Web Application

```python
from query_classifier import QueryClassifier

classifier = QueryClassifier()

@app.route('/classify', methods=['POST'])
def classify_query():
    query_text = request.json['query']
    result = classifier.classify_query(query_text)

    if result['routing'] == 'drop':
        return {"error": "Query contains inappropriate language"}, 400
    elif result['routing'] == 'community':
        # Post to community forum
        post_to_community(query_text)
    elif result['routing'] == 'admin':
        # Create admin ticket
        create_admin_ticket(query_text)

    return result
```

### In a Queue System

```python
def process_queue():
    classifier = QueryClassifier()

    while True:
        query = inbox_queue.get()
        result = classifier.classify_query(query.text)

        if result['routing'] == 'community':
            community_queue.put(query)
        elif result['routing'] == 'admin':
            admin_queue.put(query)
        # Drop others
```

## Similarity Scoring Algorithm

The system uses keyword overlap (Jaccard similarity) with stop word removal:

- Extracts keywords from both query and FAQ entry
- Removes common words ("the", "a", "and", etc.)
- Calculates: `similarity = intersection / union`
- Score range: 0.0 (completely different) to 1.0 (identical)

## Future Enhancements

- [ ] Semantic embedding-based similarity (using transformers)
- [ ] ML-based classification model for better accuracy
- [ ] Multilingual support
- [ ] Query clustering to identify patterns
- [ ] Admin feedback loop to improve classifications
- [ ] Custom rules configuration
- [ ] Audit logging for all classifications

## Support

For issues or questions about the classification system, contact the admin team.
