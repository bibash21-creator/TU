from fastapi import APIRouter, HTTPException, Header, Request
from app.schemas.result import ResultEntry, SubscriptionRequest
from app.utils.storage import load_results, save_results, subscribe_user
from app.core.config import settings
from app.routers.auth import get_serializer
import html
import re

router = APIRouter(tags=["results"])

def verify_admin_auth(request: Request, x_csrf_token: str = Header(None)):
    """Verify admin session from cookie and CSRF token"""
    session_cookie = request.cookies.get("admin_session")
    csrf_cookie = request.cookies.get("csrf_token")
    
    if not session_cookie:
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    # Verify CSRF token for state-changing operations
    if x_csrf_token != csrf_cookie:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid CSRF token")
    
    try:
        serializer = get_serializer()
        data = serializer.loads(session_cookie, max_age=3600)
        if not data.get("admin"):
            raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid or expired session")
    
    return True

def sanitize_output(text: str) -> str:
    """Escape HTML to prevent XSS attacks"""
    if not text:
        return text
    return html.escape(str(text))

@router.get("/query/{roll_number}")
async def query_result(roll_number: str):
    # Validate and sanitize input
    if not roll_number or len(roll_number) > 50:
        raise HTTPException(status_code=400, detail="Invalid roll number")
    
    # Only allow alphanumeric and common separators
    if not re.match(r'^[\w\s\-/]+$', roll_number):
        raise HTTPException(status_code=400, detail="Invalid characters in roll number")
    
    results = load_results()
    roll_number = roll_number.strip().upper()
    roll_spaced = " ".join(roll_number)
    
    for campus_data in results:
        if roll_number in campus_data["roll_numbers"]:
            semester = campus_data.get("semester", "the")
            faculty = campus_data.get("faculty", "your faculty")
            year_label = campus_data.get("year", "current batch").replace("B.S.", "").strip()
            
            # Extract detailed marks if available, safely avoiding NoneType errors
            details_obj = campus_data.get("details")
            if details_obj is None:
                details_obj = {}
            details = details_obj.get(roll_number)
            
            # Sanitize all output to prevent XSS
            response = {
                "roll_number": sanitize_output(roll_number),
                "status": sanitize_output(campus_data.get("status", "Passed")),
                "year": sanitize_output(year_label),
                "semester": sanitize_output(semester),
                "faculty": sanitize_output(faculty),
                "campus": sanitize_output(campus_data.get("campus", "TU")),
                "details": details, # The marksheet data
            }

            if campus_data.get("status") == "Expelled":
                reason = campus_data.get('reason', 'Examination Irregularity')
                response["status"] = "Failed"
                response["reason"] = sanitize_output(reason)
                response["message_en"] = sanitize_output(f"Result of {roll_spaced} withheld for {reason}.")
                response["message_np"] = sanitize_output(f"रोल नम्बर {roll_number} को नतिजा {reason} को कारणले रोकिएको छ।")
            else:
                response["message_en"] = sanitize_output(f"Congratulations. Roll number {roll_spaced} has passed {semester}.")
                response["message_np"] = sanitize_output(f"बधाई छ। रोल नम्बर {roll_number} ले {semester} मा सफलता प्राप्त गरेको छ।")
            
            return response
            
    return {
        "status": "Not Found", 
        "roll_number": sanitize_output(roll_number), 
        "message_en": sanitize_output(f"I am sorry. Roll number {roll_spaced} has not been witnessed by the Oracle yet."),
        "message_np": sanitize_output(f"क्षमा गर्नुहोस्। रोल नम्बर {roll_number} को नतिजा अहिलेसम्म प्राप्त भएको छैन।")
    }

@router.post("/subscribe")
async def subscribe(req: SubscriptionRequest):
    # Additional rate limiting for subscriptions
    success = subscribe_user(req.roll_number, req.campus, req.email, req.whatsapp)
    if success:
        return {"status": "success", "message": f"Channel established for {sanitize_output(req.roll_number)}"}
    raise HTTPException(status_code=500, detail="Subscription failed. Please try again later.")

@router.get("/list")
async def list_results(request: Request):
    # For GET requests, only verify session cookie (no CSRF needed)
    session_cookie = request.cookies.get("admin_session")
    if not session_cookie:
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    
    try:
        serializer = get_serializer()
        data = serializer.loads(session_cookie, max_age=3600)
        if not data.get("admin"):
            raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    except Exception:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid or expired session")
    
    return load_results()

@router.delete("/delete")
async def delete_result(request: Request, campus: str, semester: str, faculty: str, year: str, x_csrf_token: str = Header(None)):
    verify_admin_auth(request, x_csrf_token)
    
    try:
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
        return {"status": "success", "message": f"Results for {semester} ({year}) deleted."}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"System Database Error: {str(e)}")

@router.post("/publish")
async def publish_result(request: Request, entry: ResultEntry, x_csrf_token: str = Header(None)):
    verify_admin_auth(request, x_csrf_token)
    
    try:
        results = load_results()
        results.append(entry.dict())
        save_results(results)
        return {"status": "success", "message": f"Result for {entry.semester} published successfully."}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"System Database Error: {str(e)}")
