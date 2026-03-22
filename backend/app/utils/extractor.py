import re

def extract_results_from_text(text: str):
    """Robust extractor for roll numbers from TU result sheets"""
    # Look for roll numbers (8 digits or BIT style)
    rolls = re.findall(r"\b\d{8}\b|\bBIT\s*\d+/\d+\b", text, re.IGNORECASE)
    
    return {
        "campus": "Tribhuvan University", # Generic fallback
        "roll_numbers": list(set(rolls))
    }
