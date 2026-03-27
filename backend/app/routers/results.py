from app.schemas.result import ResultEntry, SubscriptionRequest
from app.utils.storage import load_results, save_results, subscribe_user

router = APIRouter(tags=["results"])

@router.get("/query/{roll_number}")
async def query_result(roll_number: str):
    results = load_results()
    roll_number = roll_number.strip().upper()
    roll_spaced = " ".join(roll_number)
    
    for campus_data in results:
        if roll_number in campus_data["roll_numbers"]:
            semester = campus_data.get("semester", "the")
            faculty = campus_data.get("faculty", "your faculty")
            year_label = campus_data.get("year", "current batch").replace("B.S.", "").strip()
            
            # Extract detailed marks if available
            details = campus_data.get("details", {}).get(roll_number)
            
            response = {
                "roll_number": roll_number,
                "status": campus_data.get("status", "Passed"),
                "year": year_label,
                "semester": semester,
                "faculty": faculty,
                "campus": campus_data.get("campus", "TU"),
                "details": details, # The marksheet data
            }

            if campus_data.get("status") == "Expelled":
                reason = campus_data.get('reason', 'Examination Irregularity')
                response["status"] = "Failed"
                response["reason"] = reason
                response["message_en"] = f"Result of {roll_spaced} withheld for {reason}."
                response["message_np"] = f"रोल नम्बर {roll_number} को नतिजा {reason} को कारणले रोकिएको छ।"
            else:
                response["message_en"] = f"Congratulations. Roll number {roll_spaced} has passed {semester}."
                response["message_np"] = f"बधाई छ। रोल नम्बर {roll_number} ले {semester} मा सफलता प्राप्त गरेको छ।"
            
            return response
            
    return {"status": "Not Found", "roll_number": roll_number, "message_en": "Not witnessed yet."}

@router.post("/subscribe")
async def subscribe(req: SubscriptionRequest):
    success = subscribe_user(req.roll_number, req.campus, req.email, req.whatsapp)
    if success:
        return {"status": "success", "message": f"Channel established for {req.roll_number}"}
    raise HTTPException(status_code=500, detail="Neural link failed")

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
