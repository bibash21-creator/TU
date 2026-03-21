from fastapi import APIRouter, File, UploadFile
import io
import PyPDF2
from PIL import Image
import pytesseract
from app.utils.extractor import extract_results_from_text

router = APIRouter(tags=["upload"])

@router.post("/upload-result")
async def upload_result(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()
    extracted_text = ""
    
    try:
        if filename.endswith(".pdf"):
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in reader.pages:
                extracted_text += page.extract_text() + "\n"
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            image = Image.open(io.BytesIO(contents))
            try:
                extracted_text = pytesseract.image_to_string(image)
            except Exception:
                # Fallback if tesseract binary is not found
                return {"status": "error", "message": "OCR engine (Tesseract) is not installed on this system. Please use PDF or manual entry."}
        else:
            return {"status": "error", "message": "Unsupported file format. Please upload PDF or Image."}
            
        data = extract_results_from_text(extracted_text)
        
        # If no roll numbers found, return error
        if not data["roll_numbers"]:
            return {"status": "error", "message": "No roll numbers detected in the document."}
            
        return {
            "status": "success",
            "campus": data["campus"],
            "roll_numbers": data["roll_numbers"],
            "raw_text": extracted_text[:500] + "..." # Provide a preview
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
