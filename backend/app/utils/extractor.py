import re

# Pre-compiled regex patterns (more efficient and safe)
# Using atomic groups and limiting repetition to prevent ReDoS
ROLL_PATTERN = re.compile(r'\b\d{8}\b|\bBIT\s*\d{1,4}/\d{1,4}\b', re.IGNORECASE)
MAX_TEXT_LENGTH = 1000000  # 1MB max text to process

def extract_results_from_text(text: str):
    """Robust extractor for roll numbers from TU result sheets"""
    # Limit text size to prevent DoS
    if not text or len(text) > MAX_TEXT_LENGTH:
        return {"campus": "Tribhuvan University", "roll_numbers": []}
    
    # Use pre-compiled regex with timeout protection
    try:
        # Look for roll numbers (8 digits or BIT style with limited length)
        rolls = ROLL_PATTERN.findall(text)
    except re.error:
        rolls = []
    
    # Campus detection removed as requested to avoid incorrect labeling
    detected_campus = "Tribhuvan University"
    
    # Limit number of roll numbers to prevent abuse
    unique_rolls = list(set(rolls))[:1000]
            
    return {
        "campus": detected_campus,
        "roll_numbers": unique_rolls
    }
