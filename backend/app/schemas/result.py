from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import re

class ResultEntry(BaseModel):
    campus: Optional[str] = Field(default="TU", max_length=100)
    roll_numbers: List[str] = Field(..., max_items=10000)
    details: Optional[Dict[str, Any]] = Field(default=None, max_length=1000)
    semester: str = Field(..., max_length=50)
    faculty: str = Field(..., max_length=50)
    year: str = Field(..., max_length=10)
    status: Optional[str] = Field(default="Passed", max_length=20)
    reason: Optional[str] = Field(default=None, max_length=200)
    
    @validator('roll_numbers', each_item=True)
    def validate_roll_number(cls, v):
        if not v or len(v) > 50:
            raise ValueError('Invalid roll number length')
        # Only allow alphanumeric, spaces, and common separators
        if not re.match(r'^[\w\s\-/]+$', v):
            raise ValueError('Invalid characters in roll number')
        return v.strip().upper()
    
    @validator('campus', 'semester', 'faculty', 'year', 'status', 'reason')
    def sanitize_string(cls, v):
        if v is None:
            return v
        # Remove HTML/script tags
        v = re.sub(r'<[^>]+>', '', str(v))
        return v.strip()
    
    @validator('details')
    def validate_details(cls, v):
        if v is None:
            return v
        # Limit nested depth and size
        if len(str(v)) > 10000:
            raise ValueError('Details too large')
        return v

class SubscriptionRequest(BaseModel):
    roll_number: str = Field(..., max_length=50)
    campus: str = Field(..., max_length=100)
    email: Optional[str] = Field(default=None, max_length=100)
    whatsapp: Optional[str] = Field(default=None, max_length=20)
    
    @validator('roll_number')
    def validate_roll(cls, v):
        if not v or len(v) > 50:
            raise ValueError('Invalid roll number')
        return re.sub(r'<[^>]+>', '', v).strip().upper()
    
    @validator('email')
    def validate_email(cls, v):
        if v is None or v == "":
            return None
        v = v.strip().lower()
        if len(v) > 100:
            raise ValueError('Email too long')
        # Basic email validation
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v
    
    @validator('whatsapp')
    def validate_whatsapp(cls, v):
        if v is None or v == "":
            return None
        # Only allow digits, +, -, spaces
        cleaned = re.sub(r'[^\d+\-\s]', '', v)
        if len(cleaned) > 20:
            raise ValueError('Phone number too long')
        return cleaned

class LoginRequest(BaseModel):
    username: str = Field(..., max_length=50)
    password: str = Field(..., max_length=100)
