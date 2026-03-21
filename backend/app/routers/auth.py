from fastapi import APIRouter, HTTPException
from app.schemas.result import LoginRequest
from app.core import config

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/login")
async def admin_login(credentials: LoginRequest):
    if credentials.username == config.ADMIN_USER and credentials.password == config.ADMIN_PASS:
        return {"status": "success", "token": config.ADMIN_TOKEN}
    raise HTTPException(status_code=401, detail="Invalid credentials")
