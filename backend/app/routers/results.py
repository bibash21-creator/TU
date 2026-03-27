from fastapi import APIRouter, HTTPException, Header
from app.schemas.result import ResultEntry
from app.utils.storage import load_results, save_results
from app.core.config import settings

router = APIRouter(tags=["results"])

@router.get("/query/{roll_number}")
async def query_result(roll_number: str):
    results = load_results()
    
    # Simple formatting for the voice engine to read digits one-by-one
    roll_spaced = " ".join(roll_number.strip().upper())
    roll_number = roll_number.strip().upper()
    
    for campus_data in results:
        if roll_number in campus_data["roll_numbers"]:
            semester = campus_data.get("semester", "the")
            faculty = campus_data.get("faculty", "your faculty")
            year_label = campus_data.get("year", "current batch")
            # Replace B.S. with Bikram Sambat for proper pronunciation
            year_label = year_label.replace("B.S.", "").strip()
            year_label = f"{year_label} Bikram Sambat"
            
            if campus_data.get("status") == "Expelled":
                reason = campus_data.get('reason', 'Examination Irregularity')
                return {
                    "roll_number": roll_number,
                    "status": "Failed",
                    "year": year_label,
                    "semester": semester,
                    "campus": campus_data.get("campus", "TU"),
                    "reason": reason,
                    "message_en": f"I regret to inform you that roll number {roll_spaced} from the {year_label} {semester} of {faculty} at {campus_data.get('campus', 'TU')} has failed or been withheld for {reason}.",
                    "message_np": f"माफ गर्नुहोस्, {campus_data.get('campus', 'TU')} को रोल नम्बर {roll_number} को {year_label} {semester} {faculty} को नतिजा सफल हुन सकेन वा {reason} को कारणले रोकिएको छ।",
                    "message": f"Failed {year_label}: {reason}"
                }
                
            return {
                "roll_number": roll_number,
                "status": "Passed",
                "year": year_label,
                "semester": semester,
                "faculty": faculty,
                "campus": campus_data.get("campus", "TU"),
                "message_en": f"Congratulations. Roll number {roll_spaced} from {campus_data.get('campus', 'TU')} has successfully passed the {year_label} {semester} assessment for {faculty}.",
                "message_np": f"बधाई छ। {campus_data.get('campus', 'TU')} को रोल नम्बर {roll_number} ले {year_label} को {semester} {faculty} तहको परीक्षामा सफलता प्राप्त गरेको छ।",
                "message": f"Passed {year_label} {semester}!"
            }
            
    return {
        "roll_number": roll_number,
        "status": "Not Found",
        "message_en": f"I could not find any record for roll number {roll_spaced}. Please double check the number or wait for the system to update.",
        "message_np": f"प्रणालीमा हामीले रोल नम्बर {roll_number} को कुनै पनि रेकर्ड फेला पार्न सकेनौं। कृपया आफ्नो नम्बर फेरि जाँच गर्नुहोला।",
        "message": "Not found in our database."
    }

@router.get("/list")
async def list_results(x_admin_token: str = Header(None)):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    return load_results()

@router.delete("/delete")
async def delete_result(campus: str, semester: str, faculty: str, year: str, x_admin_token: str = Header(None)):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    results = load_results()
    original_count = len(results)
    
    # Filter out the matching entry
    updated_results = [r for r in results if not (
        r.get("campus") == campus and 
        r.get("semester") == semester and 
        r.get("faculty") == faculty and 
        r.get("year") == year
    )]
    
    if len(updated_results) == original_count:
        raise HTTPException(status_code=404, detail="Result entry not found")
        
    save_results(updated_results)
    return {"status": "success", "message": f"Results for {campus} ({semester}, {year}) deleted."}

@router.post("/publish")
async def publish_result(entry: ResultEntry, x_admin_token: str = Header(None)):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Oracle Token")
    
    results = load_results()
    results.append(entry.dict())
    save_results(results)
    return {"status": "success", "message": f"Result for {entry.campus} ({entry.semester}) published successfully."}
