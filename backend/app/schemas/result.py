from pydantic import BaseModel
from typing import List, Optional

class ResultEntry(BaseModel):
    campus: Optional[str] = "TU"
    roll_numbers: List[str]
    semester: str
    faculty: str
    year: str
    status: Optional[str] = "Passed"
    reason: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
