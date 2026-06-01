"""
Example Integration and Usage Script

Demonstrates how to use the query classification system in real scenarios.
"""

import json
from query_classifier import QueryClassifier
from utils import (
    save_classification_results,
    save_routing_report,
    generate_text_report,
    print_summary,
    generate_csv_export,
    save_text_report
)


def example_1_single_query():
    """Example 1: Classify a single query."""
    print("\n" + "=" * 80)
    print("EXAMPLE 1: Single Query Classification")
    print("=" * 80)
    
    classifier = QueryClassifier()
    
    query = "Can I work on this internship while taking summer classes?"
    result = classifier.classify_query(query)
    
    print(f"\nQuery: {query}")
    print(f"\nResult:")
    print(f"  Classification: {result['classification']}")
    print(f"  Routing: {result['routing']}")
    print(f"  Confidence: {result['confidence']:.3f}")
    print(f"  Reason: {result['reason']}")
    
    if result['matched_faq_ids']:
        print(f"\n  Matched FAQ entries:")
        for match in result['matched_faq_ids']:
            print(f"    - {match['faq_id']} ({match['section']}): {match['similarity']:.3f}")


def example_2_inappropriate_language():
    """Example 2: Detect inappropriate language."""
    print("\n" + "=" * 80)
    print("EXAMPLE 2: Inappropriate Language Detection")
    print("=" * 80)
    
    classifier = QueryClassifier()
    
    queries = [
        "This is a normal question.",
        "I hate this damn program!",
        "This f***ing internship is useless."
    ]
    
    for query in queries:
        is_appropriate, flagged_words = classifier.check_language_appropriateness(query)
        status = "✓ Appropriate" if is_appropriate else "✗ Inappropriate"
        print(f"\n{status}: {query}")
        if flagged_words:
            print(f"  Flagged words: {flagged_words}")


def example_3_batch_processing():
    """Example 3: Process entire dataset and generate reports."""
    print("\n" + "=" * 80)
    print("EXAMPLE 3: Batch Processing with Full Reports")
    print("=" * 80)
    
    classifier = QueryClassifier()
    
    # Process the dataset
    print("\nClassifying queries from new_queries_dataset.json...")
    classification_results = classifier.classify_from_dataset("new_queries_dataset.json")
    
    # Generate routing report
    routing_report = classifier.generate_routing_report(classification_results)
    
    # Print summary
    print_summary(classification_results, routing_report)
    
    # Save results
    print("Saving results...")
    save_classification_results(classification_results, "classification_results.json")
    save_routing_report(routing_report, "routing_report.json")
    print("  ✓ classification_results.json")
    print("  ✓ routing_report.json")
    
    # Generate and save text report
    text_report = generate_text_report(classification_results, routing_report)
    save_text_report(text_report, "classification_report.txt")
    print("  ✓ classification_report.txt")
    
    # Export to CSV
    generate_csv_export(routing_report, "queries_export.csv")
    print("  ✓ queries_export.csv")
    
    return classification_results, routing_report


def example_4_custom_workflow():
    """Example 4: Custom workflow with filtering."""
    print("\n" + "=" * 80)
    print("EXAMPLE 4: Custom Workflow with Filtering")
    print("=" * 80)
    
    classifier = QueryClassifier()
    
    # Custom list of queries
    custom_queries = [
        {
            "id": "custom_1",
            "query": "How long is the internship?",
            "sender": "intern_001"
        },
        {
            "id": "custom_2",
            "query": "I need help with my personal situation involving my visa.",
            "sender": "intern_002"
        },
        {
            "id": "custom_3",
            "query": "This is bullshit and I want out!",
            "sender": "intern_003"
        }
    ]
    
    print("\nProcessing custom queries:")
    print("-" * 80)
    
    results = {
        "community": [],
        "admin": [],
        "dropped": []
    }
    
    for query_obj in custom_queries:
        query_text = query_obj["query"]
        result = classifier.classify_query(query_text)
        
        classification_data = {
            "query_id": query_obj["id"],
            "sender": query_obj["sender"],
            "query": query_text,
            "classification": result['classification'],
            "routing": result['routing'],
            "confidence": result['confidence']
        }
        
        if result['routing'] == 'community':
            results["community"].append(classification_data)
            print(f"✓ {query_obj['id']}: → COMMUNITY (generic)")
        elif result['routing'] == 'admin':
            results["admin"].append(classification_data)
            print(f"⚠ {query_obj['id']}: → ADMIN (private)")
        else:
            results["dropped"].append(classification_data)
            print(f"✗ {query_obj['id']}: → DROPPED (inappropriate)")
    
    print(f"\nSummary:")
    print(f"  Community: {len(results['community'])}")
    print(f"  Admin: {len(results['admin'])}")
    print(f"  Dropped: {len(results['dropped'])}")


def example_5_adjust_thresholds():
    """Example 5: Customize classification thresholds."""
    print("\n" + "=" * 80)
    print("EXAMPLE 5: Adjusting Similarity Threshold")
    print("=" * 80)
    
    classifier = QueryClassifier()
    
    query = "What are the work hours?"
    
    print(f"\nQuery: {query}\n")
    
    thresholds = [0.2, 0.3, 0.5, 0.7]
    
    for threshold in thresholds:
        result = classifier.classify_query(query, similarity_threshold=threshold)
        print(f"Threshold {threshold}:")
        print(f"  Classification: {result['classification']}")
        print(f"  Similarity: {result['highest_similarity']:.3f}")
        print(f"  Routing: {result['routing']}")
        print()


def example_6_statistics_analysis():
    """Example 6: Generate detailed statistics."""
    print("\n" + "=" * 80)
    print("EXAMPLE 6: Statistics and Analysis")
    print("=" * 80)
    
    from utils import generate_statistics
    
    classifier = QueryClassifier()
    
    # Process dataset
    classification_results = classifier.classify_from_dataset("new_queries_dataset.json")
    routing_report = classifier.generate_routing_report(classification_results)
    
    # Generate statistics
    stats = generate_statistics(classification_results)
    
    print(f"\nStatistics:")
    print(f"  Total Queries: {stats['total_queries']}")
    print(f"  Average Confidence: {stats['average_confidence']:.3f}")
    print(f"  Queries with FAQ Matches: {stats['queries_with_faq_matches']}")
    print(f"\nConfidence Distribution:")
    print(f"  High: {stats['confidence_distribution']['high']}")
    print(f"  Medium: {stats['confidence_distribution']['medium']}")
    print(f"  Low: {stats['confidence_distribution']['low']}")
    
    if stats['inappropriate_words_frequency']:
        print(f"\nInappropriate Words Found:")
        for word, count in stats['inappropriate_words_frequency'].items():
            print(f"  {word}: {count}")


def main():
    """Run all examples."""
    print("\n" + "=" * 80)
    print("QUERY CLASSIFICATION SYSTEM - EXAMPLES")
    print("=" * 80)
    
    try:
        # Run examples
        example_1_single_query()
        example_2_inappropriate_language()
        example_3_batch_processing()
        example_4_custom_workflow()
        example_5_adjust_thresholds()
        example_6_statistics_analysis()
        
        print("\n" + "=" * 80)
        print("All examples completed successfully!")
        print("=" * 80)
        print("\nGenerated files:")
        print("  - classification_results.json")
        print("  - routing_report.json")
        print("  - classification_report.txt")
        print("  - queries_export.csv")
        print("\n")
        
    except FileNotFoundError as e:
        print(f"\nError: {e}")
        print("Make sure 'new_queries_dataset.json' and 'vicharanashala_faq.json' exist.")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
