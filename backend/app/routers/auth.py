from fastapi import APIRouter, HTTPException
from app.schemas.result import LoginRequest
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/login")
async def admin_login(credentials: LoginRequest):
    if credentials.username == settings.ADMIN_USER and credentials.password == settings.ADMIN_PASS:
        return {"status": "success", "token": settings.ADMIN_TOKEN}
    raise HTTPException(status_code=401, detail="Invalid credentials")
