from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas.result import LoginRequest
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def admin_login(request: Request, credentials: LoginRequest):
    if credentials.username == settings.ADMIN_USER and credentials.password == settings.ADMIN_PASS:
        return {"status": "success", "token": settings.ADMIN_TOKEN}
    raise HTTPException(status_code=401, detail="Invalid credentials")
