"""
Nepali Voice Script Generator for Result Announcements
Generates culturally appropriate Nepali scripts for pass/fail scenarios
"""

def generate_nepali_script(student_data: dict) -> dict:
    """
    Generate Nepali announcement script based on result status
    
    Args:
        student_data: dict with keys: roll_number, status, campus, semester, 
                      faculty, year, details (optional)
    
    Returns:
        dict with nepali_text, english_text, emotion
    """
    status = student_data.get("status", "Passed")
    roll_number = student_data.get("roll_number", "")
    campus = student_data.get("campus", "Tribhuvan University")
    semester = student_data.get("semester", "")
    
    # Extract name from roll number if available (last 4 digits as pseudo-name)
    roll_suffix = roll_number[-4:] if roll_number else ""
    
    if status == "Passed":
        nepali_text = f"""नमस्ते विद्यार्थी मित्र। तपाईंको रोल नम्बर {roll_number} को नतिजा आएको छ। 
तपाईंले {semester} मा उत्तीर्ण गर्नुभएको छ। यो निकै राम्रो उपलब्धि हो। 
तपाईंलाई हार्दिक बधाई छ। तपाईंको भविष्य उज्ज्वल रहोस्।"""
        
        english_text = f"""Hello student. Your result for roll number {roll_number} has arrived. 
You have passed {semester}. This is a great achievement. 
Congratulations! May your future be bright."""
        
        emotion = "happy"
        
    elif status == "Failed" or status == "Expelled":
        reason = student_data.get("reason", "")
        
        if reason:
            nepali_text = f"""नमस्ते विद्यार्थी मित्र। तपाईंको रोल नम्बर {roll_number} को नतिजा आएको छ। 
दुःखको साथ भन्नुपर्दा, तपाईंको नतिजा {reason} को कारणले रोकिएको छ। 
कृपया आफ्नो क्याम्पस वा परीक्षा नियन्त्रण कार्यालयमा सम्पर्क गर्नुहोस्।"""
            
            english_text = f"""Hello student. Your result for roll number {roll_number} has arrived. 
Unfortunately, your result has been withheld due to {reason}. 
Please contact your campus or examination control office."""
        else:
            nepali_text = f"""नमस्ते विद्यार्थी मित्र। तपाईंको रोल नम्बर {roll_number} को नतिजा आएको छ। 
यसपटक तपाईं उत्तीर्ण हुन सक्नुभएन। निराश नहुनुहोस्। 
अझ मेहनत गरेर अर्को पटक राम्रो गर्न सक्नुहुन्छ। हिम्मत नहार्नुहोस्।"""
            
            english_text = f"""Hello student. Your result for roll number {roll_number} has arrived. 
This time you could not pass. Don't be discouraged. 
With more hard work, you can do better next time. Never give up."""
        
        emotion = "sympathetic"
        
    else:  # Not Found
        nepali_text = f"""माफ गर्नुहोस्। रोल नम्बर {roll_number} को नतिजा हाम्रो प्रणालीमा फेला परेन। 
कृपया आफ्नो रोल नम्बर सही भएको जाँच गर्नुहोस् वा पछि फेरि प्रयास गर्नुहोस्।"""
        
        english_text = f"""Sorry. The result for roll number {roll_number} was not found in our system. 
Please check if your roll number is correct or try again later."""
        
        emotion = "neutral"
    
    return {
        "nepali_text": nepali_text.strip(),
        "english_text": english_text.strip(),
        "emotion": emotion,
        "roll_number": roll_number
    }

def generate_short_nepali_script(student_data: dict) -> dict:
    """Generate shorter version for faster TTS processing"""
    status = student_data.get("status", "Passed")
    roll_number = student_data.get("roll_number", "")
    semester = student_data.get("semester", "")
    
    if status == "Passed":
        nepali_text = f"बधाई छ! तपाईंले {semester} उत्तीर्ण गर्नुभएको छ।"
        emotion = "happy"
    elif status == "Failed":
        nepali_text = f"तपाईंको नतिजा आएको छ। यसपटक उत्तीर्ण हुन सक्नुभएन। अर्को पटक राम्रो गर्नुहोस्।"
        emotion = "sympathetic"
    else:
        nepali_text = f"माफ गर्नुहोस्, रोल नम्बर {roll_number} को नतिजा फेला परेन।"
        emotion = "neutral"
    
    return {
        "nepali_text": nepali_text,
        "english_text": "",
        "emotion": emotion,
        "roll_number": roll_number
    }
