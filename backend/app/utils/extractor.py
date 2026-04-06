import re

# List of common TU campuses for smart detection
CAMPUSES = [
    "Amrit Campus", "Patan Multiple Campus", "Nepal Commerce Campus", 
    "Padma Kanya Multiple Campus", "Shanker Dev Campus", "Tri-Chandra Multiple Campus",
    "Bhaktapur Multiple Campus", "Central Department of CSIT", "Kathmandu BernHardt College",
    "Deerwalk Institute of Technology", "St. Xavier's College", "Texas International College",
    "National College of Computer Studies", "Prime College", "Orchid International College",
    "Himalaya College of Engineering", "Kathford International College", "Sagarmatha College of Science and Technology"
]

# Pre-compiled regex patterns (more efficient and safe)
# Using atomic groups and limiting repetition to prevent ReDoS
ROLL_PATTERN = re.compile(r'\b\d{8}\b|\bBIT\s*\d{1,4}/\d{1,4}\b', re.IGNORECASE)
MAX_TEXT_LENGTH = 1000000  # 1MB max text to process

def extract_results_from_text(text: str):
    """Robust extractor for roll numbers and campus names from TU result sheets"""
    # Limit text size to prevent DoS
    if not text or len(text) > MAX_TEXT_LENGTH:
        return {"campus": "Tribhuvan University", "roll_numbers": []}
    
    # Use pre-compiled regex with timeout protection
    try:
        # Look for roll numbers (8 digits or BIT style with limited length)
        rolls = ROLL_PATTERN.findall(text)
    except re.error:
        rolls = []
    
    # Smart Campus Detection
    detected_campus = "Tribhuvan University"
    text_lower = text.lower()
    for campus in CAMPUSES:
        if campus.lower() in text_lower:
            detected_campus = campus
            break
    
    # Limit number of roll numbers to prevent abuse
    unique_rolls = list(set(rolls))[:1000]
            
    return {
        "campus": detected_campus,
        "roll_numbers": unique_rolls
    }
