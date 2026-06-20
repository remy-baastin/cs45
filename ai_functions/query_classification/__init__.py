"""
Query Classification Package Initialization

Exports main classes and functions for easy importing.
"""

from .query_classifier import QueryClassifier
from .utils import (
    save_classification_results,
    save_routing_report,
    generate_statistics,
    generate_csv_export,
    generate_text_report,
    save_text_report,
    print_summary
)

__all__ = [
    'QueryClassifier',
    'save_classification_results',
    'save_routing_report',
    'generate_statistics',
    'generate_csv_export',
    'generate_text_report',
    'save_text_report',
    'print_summary'
]

__version__ = '1.0.0'
__description__ = 'Query classification system for Vicharanashala internship'
