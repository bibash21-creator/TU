from fastapi import APIRouter, HTTPException
from app.schemas.result import ResultEntry
from app.utils.storage import load_results, save_results

router = APIRouter(tags=["results"])

@router.get("/query/{roll_number}")
async def query_result(roll_number: str):
    results = load_results()
    
    # Clean roll number for comparison
    roll_number = roll_number.strip().upper()
    
    for campus_data in results:
        if roll_number in campus_data["roll_numbers"]:
            campus = campus_data["campus"]
            if campus_data.get("status") == "Expelled":
                reason = campus_data.get('reason')
                return {
                    "roll_number": roll_number,
                    "status": "Expelled",
                    "campus": campus,
                    "reason": reason,
                    "message_en": f"Oof, bad news! 💀 Roll {roll_number} got expelled for '{reason}'. Better luck next time, fam.",
                    "message_np": f"ओहो, नराम्रो खबर! 💀 रोल नम्बर {roll_number} परीक्षामा {reason} को कारणले आउट भएको छ। अर्को पटक प्रयास गर साथी।",
                    "message": f"Expelled: {reason}"
                }
            return {
                "roll_number": roll_number,
                "status": "Passed",
                "campus": campus,
                "semester": campus_data.get("semester", "N/A"),
                "faculty": campus_data.get("faculty", "N/A"),
                "message_en": f"Yooo! Big W! 🔥 Roll {roll_number} just cleared {campus_data.get('semester', 'the')} exams for {campus_data.get('faculty', 'your program')} at {campus}. You're absolute fire! 🚀",
                "message_np": f"बधाई छ साथी! 🔥 रोल नम्बर {roll_number}, तिमीले {campus} बाट {campus_data.get('semester', '')} {campus_data.get('faculty', '')} परीक्षा पास गर्यौ। कडा छौ है! 🚀",
                "message": f"Passed {campus_data.get('semester', '')} from {campus}!"
            }
            
    return {
        "roll_number": roll_number,
        "status": "Not Found",
        "message_en": f"404: Roll {roll_number} not found. 🧐 Check that digits again, bestie!",
        "message_np": f"माफ गर साथी, रोल नम्बर {roll_number} भेटिएन। 🧐 फेरि एकचोटी चेक गर न है।",
        "message": "Not found in our database."
    }

@router.post("/publish")
async def publish_result(entry: ResultEntry):
    results = load_results()
    results.append(entry.dict())
    save_results(results)
    return {"status": "success", "message": f"Result for {entry.campus} ({entry.semester}) published successfully."}
