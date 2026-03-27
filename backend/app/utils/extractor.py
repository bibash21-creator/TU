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

def extract_results_from_text(text: str):
    """Robust extractor for roll numbers and campus names from TU result sheets"""
    # Look for roll numbers (8 digits or BIT style)
    rolls = re.findall(r"\b\d{8}\b|\bBIT\s*\d+/\d+\b", text, re.IGNORECASE)
    
    # Smart Campus Detection
    detected_campus = "Tribhuvan University"
    for campus in CAMPUSES:
        if campus.lower() in text.lower():
            detected_campus = campus
            break
            
    return {
        "campus": detected_campus,
        "roll_numbers": list(set(rolls))
    }
