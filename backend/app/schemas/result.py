from pydantic import BaseModel
from typing import List, Optional

from typing import List, Optional, Dict, Any

class ResultEntry(BaseModel):
    campus: Optional[str] = "TU"
    roll_numbers: List[str]
    details: Optional[Dict[str, Any]] = None # roll: {marks: {}, total, etc}
    semester: str
    faculty: str
    year: str
    status: Optional[str] = "Passed"
    reason: Optional[str] = None

class SubscriptionRequest(BaseModel):
    roll_number: str
    campus: str
    email: Optional[str] = None
    whatsapp: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
