import re

def extract_results_from_text(text: str):
    """Simple regex based extractor for roll numbers and campus"""
    # Look for Campus Name (Assume it starts with "Campus: " or is near the top)
    campus_match = re.search(r"Campus:\s*(.*)", text, re.IGNORECASE)
    campus = campus_match.group(1).strip() if campus_match else "Extracted Campus"
    
    # Look for roll numbers (8 digits or BIT style)
    rolls = re.findall(r"\b\d{8}\b|\bBIT\s*\d+/\d+\b", text, re.IGNORECASE)
    
    # Check for expelled keywords near roll numbers
    # This is a bit advanced, but for now we'll just return the lists
    return {
        "campus": campus,
        "roll_numbers": list(set(rolls)) # Unique
    }
