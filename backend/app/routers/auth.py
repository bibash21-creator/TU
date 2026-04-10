from fastapi import APIRouter, HTTPException, Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas.result import LoginRequest
from app.core.config import settings
from itsdangerous import URLSafeTimedSerializer
import secrets

router = APIRouter(prefix="/admin", tags=["admin"])
limiter = Limiter(key_func=get_remote_address)

# Secure cookie serializer
def get_serializer():
    return URLSafeTimedSerializer(settings.SECRET_KEY, salt="admin-session")

def generate_csrf_token():
    return secrets.token_urlsafe(32)

@router.post("/login")
@limiter.limit("5/minute")
async def admin_login(response: Response, request: Request, credentials: LoginRequest):
    if credentials.username == settings.ADMIN_USER and credentials.password == settings.ADMIN_PASS:
        # Generate secure session token
        serializer = get_serializer()
        session_token = serializer.dumps({"admin": True})
        csrf_token = generate_csrf_token()
        
        # Set httpOnly cookie (secure, not accessible via JavaScript)
        response.set_cookie(
            key="admin_session",
            value=session_token,
            httponly=True,
            secure=True,  # Mandatory for SameSite=None
            samesite="none", # Allow cross-site for Vercel -> Render
            max_age=3600  # 1 hour
        )
        
        # CSRF token for non-GET requests (sent in header)
        response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            httponly=False,  # Accessible by JS for header inclusion
            secure=True,     # Mandatory for SameSite=None
            samesite="none", # Allow cross-site for Vercel -> Render
            max_age=3600
        )
        
        return {"status": "success", "csrf_token": csrf_token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def admin_logout(response: Response):
    response.delete_cookie("admin_session")
    response.delete_cookie("csrf_token")
    return {"status": "success", "message": "Logged out successfully"}

@router.get("/verify")
async def verify_session(request: Request):
    """Verify if admin session is valid"""
    session_cookie = request.cookies.get("admin_session")
    if not session_cookie:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        serializer = get_serializer()
        data = serializer.loads(session_cookie, max_age=3600)
        return {"status": "success", "admin": data.get("admin")}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
