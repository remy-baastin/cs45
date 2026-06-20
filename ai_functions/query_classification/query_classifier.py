"""
Query Classification Module for Vicharanashala Internship

This module provides functionality to:
1. Classify new queries as "generic" or "private" based on FAQ similarity
2. Check for inappropriate language in queries
3. Route queries to appropriate destinations (community, admin, or drop)
"""

import json
import re
import os
from typing import Dict, List, Tuple, Optional
from pathlib import Path


class QueryClassifier:
    """Classify and filter intern queries based on FAQ and language rules."""

    def __init__(self, faq_path: str = None, inappropriate_words_path: str = None):
        """
        Initialize the classifier with FAQ data and language filters.
        
        Args:
            faq_path: Path to the FAQ JSON file
            inappropriate_words_path: Path to inappropriate words list (optional)
        """
        self.faq_data = self._load_faq(faq_path)
        self.inappropriate_words = self._load_inappropriate_words(inappropriate_words_path)
        
    def _load_faq(self, faq_path: str) -> Dict:
        """Load FAQ data from JSON file."""
        if faq_path is None:
            # Try to find FAQ in the workspace
            possible_paths = [
                "/Users/riddhimadeshmukh/Documents/Projects/Summership/cs45/vicharanashala_faq.json",
                "./vicharanashala_faq.json",
                "../vicharanashala_faq.json"
            ]
            faq_path = next((p for p in possible_paths if os.path.exists(p)), None)
            
        if faq_path and os.path.exists(faq_path):
            with open(faq_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _load_inappropriate_words(self, path: str = None) -> set:
        """
        Load inappropriate words from a file or use defaults.
        
        Args:
            path: Path to inappropriate words file
            
        Returns:
            Set of inappropriate words
        """
        default_inappropriate = {
            'damn', 'hell', 'crap', 'shit', 'fuck', 'f***', 'ass', 'asshole',
            'bastard', 'bitch', 'piss', 'goddamn', 'bullshit', 'bullcrap', 'hate',
            'sucks', 'sucks ass', 'f**king', 'freaking', 'dammit', 'wtf'
        }
        
        if path and os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return set(word.strip().lower() for word in f.readlines())
            except Exception:
                pass
                
        return default_inappropriate
    
    def check_language_appropriateness(self, query: str) -> Tuple[bool, List[str]]:
        """
        Check if query contains inappropriate language.
        
        Args:
            query: The query text to check
            
        Returns:
            Tuple of (is_appropriate, list_of_flagged_words)
        """
        query_lower = query.lower()
        flagged_words = []
        
        # Check for exact word matches and variations
        for word in self.inappropriate_words:
            # Exact word match with word boundaries
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, query_lower):
                flagged_words.append(word)
            # Also catch common variations like f** or s***
            elif self._match_censored_variant(query_lower, word):
                flagged_words.append(word)
        
        is_appropriate = len(flagged_words) == 0
        return is_appropriate, flagged_words
    
    def _match_censored_variant(self, query_lower: str, word: str) -> bool:
        """Check for censored variations of inappropriate words (e.g., f***, s***)."""
        if len(word) < 2:
            return False
        
        first_char = word[0]
        last_char = word[-1]
        # Pattern: first char followed by asterisks/dashes and last char
        pattern = re.escape(first_char) + r'[\*\-_]+' + re.escape(last_char)
        return bool(re.search(pattern, query_lower))
    
    def _calculate_similarity_score(self, query: str, faq_text: str) -> float:
        """
        Calculate similarity between query and FAQ text using keyword overlap.
        
        Args:
            query: The new query
            faq_text: FAQ entry text
            
        Returns:
            Similarity score (0-1)
        """
        query_words = set(query.lower().split())
        faq_words = set(faq_text.lower().split())
        
        # Remove common stop words for better matching
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are'}
        query_words -= stop_words
        faq_words -= stop_words
        
        if not query_words or not faq_words:
            return 0.0
        
        # Jaccard similarity
        intersection = len(query_words & faq_words)
        union = len(query_words | faq_words)
        
        return intersection / union if union > 0 else 0.0
    
    def classify_query(self, query: str, similarity_threshold: float = 0.3) -> Dict:
        """
        Classify a query as generic or private based on FAQ matching and content analysis.
        
        Args:
            query: The query to classify
            similarity_threshold: Similarity score threshold for generic classification
            
        Returns:
            Dictionary with classification results
        """
        result = {
            "query": query,
            "is_appropriate": True,
            "inappropriate_words": [],
            "classification": None,
            "confidence": 0.0,
            "matched_faq_ids": [],
            "highest_similarity": 0.0,
            "routing": None,
            "reason": ""
        }
        
        # Step 1: Check for inappropriate language
        is_appropriate, flagged_words = self.check_language_appropriateness(query)
        result["is_appropriate"] = is_appropriate
        result["inappropriate_words"] = flagged_words
        
        if not is_appropriate:
            result["classification"] = "inappropriate"
            result["routing"] = "drop"
            result["reason"] = f"Query contains inappropriate language: {', '.join(flagged_words)}"
            return result
        
        # Step 2: Compare with FAQ entries to determine if generic or private
        if not self.faq_data or "entries" not in self.faq_data:
            # If no FAQ data, err on the side of caution
            result["classification"] = "private"
            result["routing"] = "admin"
            result["reason"] = "No FAQ data available for comparison"
            return result
        
        # Calculate similarity with all FAQ entries
        max_similarity = 0.0
        matched_faq_ids = []
        
        for entry in self.faq_data.get("entries", []):
            faq_full_text = entry.get("text_for_embedding", "")
            similarity = self._calculate_similarity_score(query, faq_full_text)
            
            if similarity > max_similarity:
                max_similarity = similarity
            
            if similarity > similarity_threshold:
                matched_faq_ids.append({
                    "faq_id": entry.get("id"),
                    "similarity": round(similarity, 3),
                    "section": entry.get("section_title")
                })
        
        result["highest_similarity"] = round(max_similarity, 3)
        result["matched_faq_ids"] = matched_faq_ids
        
        # Step 3: Determine classification
        # Check for private indicators in query content
        private_indicators = [
            "personal", "medical", "family", "health", "financial", "private",
            "confidential", "individual", "my situation", "my case", "my specific",
            "mental health", "mental state", "personal circumstances"
        ]
        
        query_lower = query.lower()
        has_private_indicators = any(indicator in query_lower for indicator in private_indicators)
        
        if has_private_indicators or max_similarity < similarity_threshold:
            result["classification"] = "private"
            result["routing"] = "admin"
            result["reason"] = "Query involves personal circumstances or is not covered by FAQ"
            result["confidence"] = 0.8 if has_private_indicators else 0.6
        else:
            result["classification"] = "generic"
            result["routing"] = "community"
            result["reason"] = f"Query matches FAQ with {len(matched_faq_ids)} similar entries"
            result["confidence"] = min(0.95, max_similarity + 0.3)
        
        return result
    
    def classify_batch(self, queries: List[str]) -> List[Dict]:
        """
        Classify multiple queries at once.
        
        Args:
            queries: List of query strings
            
        Returns:
            List of classification results
        """
        return [self.classify_query(query) for query in queries]
    
    def classify_from_dataset(self, dataset_path: str) -> Dict:
        """
        Classify queries from a dataset JSON file.
        
        Args:
            dataset_path: Path to the queries dataset JSON
            
        Returns:
            Dictionary with classification results and routing summary
        """
        with open(dataset_path, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
        
        results = {
            "metadata": dataset.get("metadata", {}),
            "classifications": [],
            "summary": {
                "total_queries": 0,
                "generic": 0,
                "private": 0,
                "inappropriate": 0,
                "dropped": 0
            }
        }
        
        for query_obj in dataset.get("queries", []):
            query_text = query_obj.get("query", "")
            classification = self.classify_query(query_text)
            
            # Add original ID for reference
            classification["query_id"] = query_obj.get("id")
            classification["expected_category"] = query_obj.get("category")
            
            results["classifications"].append(classification)
            
            # Update summary
            results["summary"]["total_queries"] += 1
            if classification["classification"] == "inappropriate":
                results["summary"]["inappropriate"] += 1
                results["summary"]["dropped"] += 1
            elif classification["classification"] == "generic":
                results["summary"]["generic"] += 1
            elif classification["classification"] == "private":
                results["summary"]["private"] += 1
        
        return results
    
    def generate_routing_report(self, classification_results: Dict) -> Dict:
        """
        Generate a routing report for classified queries.
        
        Args:
            classification_results: Output from classify_from_dataset
            
        Returns:
            Dictionary with queries grouped by routing destination
        """
        report = {
            "community_generic": [],
            "admin_private": [],
            "dropped_inappropriate": [],
            "routing_summary": {
                "to_community": 0,
                "to_admin": 0,
                "dropped": 0
            }
        }
        
        for result in classification_results.get("classifications", []):
            routing = result.get("routing")
            query_info = {
                "query_id": result.get("query_id"),
                "query": result.get("query"),
                "confidence": result.get("confidence"),
                "reason": result.get("reason"),
                "inappropriate_words": result.get("inappropriate_words")
            }
            
            if routing == "community":
                report["community_generic"].append(query_info)
                report["routing_summary"]["to_community"] += 1
            elif routing == "admin":
                report["admin_private"].append(query_info)
                report["routing_summary"]["to_admin"] += 1
            elif routing == "drop":
                report["dropped_inappropriate"].append(query_info)
                report["routing_summary"]["dropped"] += 1
        
        return report


def main():
    """Example usage of the QueryClassifier."""
    # Initialize classifier
    classifier = QueryClassifier()
    
    # Example: Classify a single query
    sample_queries = [
        "When can I start the internship?",
        "I have severe anxiety issues and need accommodations. Can we discuss?",
        "This internship sucks ass and I hate every second of it!",
        "Can I take a 2-week break for my sister's wedding?"
    ]
    
    print("=" * 80)
    print("SINGLE QUERY CLASSIFICATION EXAMPLES")
    print("=" * 80)
    for query in sample_queries:
        result = classifier.classify_query(query)
        print(f"\nQuery: {query}")
        print(f"Classification: {result['classification']}")
        print(f"Routing: {result['routing']}")
        print(f"Confidence: {result['confidence']:.2f}")
        print(f"Reason: {result['reason']}")
        if result['inappropriate_words']:
            print(f"Flagged words: {result['inappropriate_words']}")
    
    # Example: Classify from dataset
    dataset_path = "new_queries_dataset.json"
    if os.path.exists(dataset_path):
        print("\n" + "=" * 80)
        print("BATCH CLASSIFICATION FROM DATASET")
        print("=" * 80)
        
        classification_results = classifier.classify_from_dataset(dataset_path)
        print(f"\nTotal queries processed: {classification_results['summary']['total_queries']}")
        print(f"Generic (to community): {classification_results['summary']['generic']}")
        print(f"Private (to admin): {classification_results['summary']['private']}")
        print(f"Inappropriate (dropped): {classification_results['summary']['inappropriate']}")
        
        # Generate routing report
        routing_report = classifier.generate_routing_report(classification_results)
        print(f"\nRouting Summary:")
        print(f"  → Community Forum: {routing_report['routing_summary']['to_community']}")
        print(f"  → Admin Review: {routing_report['routing_summary']['to_admin']}")
        print(f"  → Dropped: {routing_report['routing_summary']['dropped']}")
        
        # Save results
        output_path = "classification_results.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(classification_results, f, indent=2, ensure_ascii=False)
        print(f"\nDetailed results saved to: {output_path}")


if __name__ == "__main__":
    main()
