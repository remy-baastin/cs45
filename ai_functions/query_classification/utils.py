"""
Utility functions for query classification system.

Provides helper functions for:
- Formatting and exporting results
- Statistical analysis
- Integration helpers
"""

import json
from typing import Dict, List, Optional
from datetime import datetime


def save_classification_results(results: Dict, output_path: str = "classification_results.json") -> str:
    """
    Save classification results to a JSON file.
    
    Args:
        results: Classification results dictionary
        output_path: Path where results will be saved
        
    Returns:
        Path to saved file
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    return output_path


def save_routing_report(report: Dict, output_path: str = "routing_report.json") -> str:
    """
    Save routing report to a JSON file.
    
    Args:
        report: Routing report dictionary
        output_path: Path where report will be saved
        
    Returns:
        Path to saved file
    """
    # Add timestamp
    report['generated_at'] = datetime.now().isoformat()
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    return output_path


def generate_statistics(classification_results: Dict) -> Dict:
    """
    Generate detailed statistics from classification results.
    
    Args:
        classification_results: Output from classify_from_dataset
        
    Returns:
        Dictionary with various statistics
    """
    stats = {
        "total_queries": 0,
        "by_classification": {
            "generic": 0,
            "private": 0,
            "inappropriate": 0
        },
        "by_routing": {
            "community": 0,
            "admin": 0,
            "dropped": 0
        },
        "confidence_distribution": {
            "high": 0,      # 0.8 - 1.0
            "medium": 0,    # 0.5 - 0.79
            "low": 0        # 0.0 - 0.49
        },
        "inappropriate_words_frequency": {},
        "average_confidence": 0.0,
        "queries_with_faq_matches": 0
    }
    
    total_confidence = 0
    
    for result in classification_results.get('classifications', []):
        stats["total_queries"] += 1
        
        # Classification distribution
        classification = result.get('classification')
        if classification in stats["by_classification"]:
            stats["by_classification"][classification] += 1
        
        # Routing distribution
        routing = result.get('routing')
        if routing in stats["by_routing"]:
            stats["by_routing"][routing] += 1
        
        # Confidence distribution
        confidence = result.get('confidence', 0)
        total_confidence += confidence
        
        if confidence >= 0.8:
            stats["confidence_distribution"]["high"] += 1
        elif confidence >= 0.5:
            stats["confidence_distribution"]["medium"] += 1
        else:
            stats["confidence_distribution"]["low"] += 1
        
        # Inappropriate words frequency
        for word in result.get('inappropriate_words', []):
            stats["inappropriate_words_frequency"][word] = \
                stats["inappropriate_words_frequency"].get(word, 0) + 1
        
        # FAQ matches
        if result.get('matched_faq_ids'):
            stats["queries_with_faq_matches"] += 1
    
    if stats["total_queries"] > 0:
        stats["average_confidence"] = round(total_confidence / stats["total_queries"], 3)
    
    return stats


def generate_csv_export(routing_report: Dict, output_path: str = "queries_export.csv") -> str:
    """
    Export routing report to CSV format for easy viewing in spreadsheets.
    
    Args:
        routing_report: Output from generate_routing_report
        output_path: Path where CSV will be saved
        
    Returns:
        Path to saved file
    """
    import csv
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow(['Query ID', 'Query Text', 'Classification', 'Routing', 'Confidence', 'Reason'])
        
        # Community queries
        for query in routing_report.get('community_generic', []):
            writer.writerow([
                query.get('query_id'),
                query.get('query'),
                'Generic',
                'Community',
                query.get('confidence', ''),
                query.get('reason', '')
            ])
        
        # Admin queries
        for query in routing_report.get('admin_private', []):
            writer.writerow([
                query.get('query_id'),
                query.get('query'),
                'Private',
                'Admin',
                query.get('confidence', ''),
                query.get('reason', '')
            ])
        
        # Dropped queries
        for query in routing_report.get('dropped_inappropriate', []):
            flagged = ', '.join(query.get('inappropriate_words', []))
            writer.writerow([
                query.get('query_id'),
                query.get('query'),
                'Inappropriate',
                'Dropped',
                query.get('confidence', ''),
                f"Flagged: {flagged}"
            ])
    
    return output_path


def generate_text_report(classification_results: Dict, routing_report: Dict) -> str:
    """
    Generate a human-readable text report.
    
    Args:
        classification_results: Output from classify_from_dataset
        routing_report: Output from generate_routing_report
        
    Returns:
        Text report as string
    """
    stats = generate_statistics(classification_results)
    
    report = []
    report.append("=" * 80)
    report.append("QUERY CLASSIFICATION REPORT")
    report.append("=" * 80)
    report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Summary
    report.append("SUMMARY")
    report.append("-" * 80)
    report.append(f"Total Queries Processed: {stats['total_queries']}")
    report.append(f"Average Confidence Score: {stats['average_confidence']:.3f}\n")
    
    # Classification breakdown
    report.append("CLASSIFICATION BREAKDOWN")
    report.append("-" * 80)
    for classification, count in stats["by_classification"].items():
        percentage = (count / stats["total_queries"] * 100) if stats["total_queries"] > 0 else 0
        report.append(f"  {classification.upper():15} : {count:3} queries ({percentage:5.1f}%)")
    report.append("")
    
    # Routing breakdown
    report.append("ROUTING BREAKDOWN")
    report.append("-" * 80)
    report.append(f"  TO COMMUNITY FORUM: {routing_report['routing_summary']['to_community']} queries")
    report.append(f"  TO ADMIN REVIEW   : {routing_report['routing_summary']['to_admin']} queries")
    report.append(f"  DROPPED           : {routing_report['routing_summary']['dropped']} queries\n")
    
    # Confidence distribution
    report.append("CONFIDENCE DISTRIBUTION")
    report.append("-" * 80)
    report.append(f"  HIGH (0.8-1.0)   : {stats['confidence_distribution']['high']} queries")
    report.append(f"  MEDIUM (0.5-0.79): {stats['confidence_distribution']['medium']} queries")
    report.append(f"  LOW (0.0-0.49)   : {stats['confidence_distribution']['low']} queries\n")
    
    # Inappropriate words
    if stats["inappropriate_words_frequency"]:
        report.append("INAPPROPRIATE WORDS FOUND")
        report.append("-" * 80)
        for word, count in sorted(stats["inappropriate_words_frequency"].items(), 
                                   key=lambda x: x[1], reverse=True):
            report.append(f"  {word:20} : {count} occurrence(s)")
        report.append("")
    
    # FAQ coverage
    report.append("FAQ COVERAGE")
    report.append("-" * 80)
    percentage = (stats['queries_with_faq_matches'] / stats['total_queries'] * 100) \
                 if stats['total_queries'] > 0 else 0
    report.append(f"  Queries with FAQ matches: {stats['queries_with_faq_matches']} ({percentage:.1f}%)\n")
    
    # Detailed routing tables
    report.append("COMMUNITY FORUM QUERIES (Generic)")
    report.append("-" * 80)
    if routing_report['community_generic']:
        for q in routing_report['community_generic']:
            report.append(f"  [{q['query_id']}] {q['query'][:70]}")
            report.append(f"    Confidence: {q['confidence']:.3f} | {q['reason']}")
            report.append("")
    else:
        report.append("  (No queries)")
        report.append("")
    
    report.append("ADMIN REVIEW QUERIES (Private)")
    report.append("-" * 80)
    if routing_report['admin_private']:
        for q in routing_report['admin_private']:
            report.append(f"  [{q['query_id']}] {q['query'][:70]}")
            report.append(f"    Confidence: {q['confidence']:.3f} | {q['reason']}")
            report.append("")
    else:
        report.append("  (No queries)")
        report.append("")
    
    report.append("DROPPED QUERIES (Inappropriate)")
    report.append("-" * 80)
    if routing_report['dropped_inappropriate']:
        for q in routing_report['dropped_inappropriate']:
            report.append(f"  [{q['query_id']}] {q['query'][:70]}")
            flagged = ', '.join(q.get('inappropriate_words', []))
            report.append(f"    Flagged words: {flagged}")
            report.append("")
    else:
        report.append("  (No queries)")
        report.append("")
    
    report.append("=" * 80)
    
    return "\n".join(report)


def save_text_report(report_text: str, output_path: str = "classification_report.txt") -> str:
    """
    Save text report to file.
    
    Args:
        report_text: Text report content
        output_path: Path where report will be saved
        
    Returns:
        Path to saved file
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report_text)
    return output_path


def get_queries_by_routing(routing_report: Dict, routing: str) -> List[Dict]:
    """
    Get all queries for a specific routing destination.
    
    Args:
        routing_report: Output from generate_routing_report
        routing: 'community', 'admin', or 'dropped'
        
    Returns:
        List of queries for that routing
    """
    if routing == 'community':
        return routing_report.get('community_generic', [])
    elif routing == 'admin':
        return routing_report.get('admin_private', [])
    elif routing == 'dropped':
        return routing_report.get('dropped_inappropriate', [])
    else:
        return []


def print_summary(classification_results: Dict, routing_report: Dict):
    """
    Print a concise summary to console.
    
    Args:
        classification_results: Output from classify_from_dataset
        routing_report: Output from generate_routing_report
    """
    print("\n" + "=" * 60)
    print("CLASSIFICATION SUMMARY")
    print("=" * 60)
    
    summary = classification_results['summary']
    print(f"Total Queries: {summary['total_queries']}")
    print(f"  ✓ Generic: {summary['generic']}")
    print(f"  ⚠ Private: {summary['private']}")
    print(f"  ✗ Inappropriate: {summary['inappropriate']}")
    print()
    print("ROUTING:")
    print(f"  → Community: {routing_report['routing_summary']['to_community']}")
    print(f"  → Admin: {routing_report['routing_summary']['to_admin']}")
    print(f"  → Dropped: {routing_report['routing_summary']['dropped']}")
    print("=" * 60 + "\n")
