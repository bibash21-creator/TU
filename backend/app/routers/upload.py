from fastapi import APIRouter, File, UploadFile, HTTPException
import io
import PyPDF2
from PIL import Image
import pytesseract
import os
import magic
from app.utils.extractor import extract_results_from_text

router = APIRouter(tags=["upload"])

# Security constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}

def validate_file(file: UploadFile, contents: bytes):
    """Validate file size, extension, and MIME type"""
    # Check file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB.")
    
    # Check extension
    filename = file.filename.lower()
    ext = os.path.splitext(filename)[1]
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Check MIME type
    mime = magic.from_buffer(contents, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type detected.")
    
    # Check for path traversal in filename
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

@router.post("/upload-result")
async def upload_result(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()
    
    # Validate file
    validate_file(file, contents)
    
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
    except HTTPException:
        raise
    except Exception:
        # Log the actual error internally but don't expose it
        import logging
        logging.error("File processing error", exc_info=True)
        return {"status": "error", "message": "Failed to process file. Please try again or contact support."}
