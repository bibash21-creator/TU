from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import auth, results, upload, voice
from app.core.config import settings
from app.routers.auth import limiter
import uvicorn
import re

# Security middleware to validate requests
class SecurityMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Block suspicious user agents
            user_agent = request.headers.get("user-agent", "").lower()
            blocked_agents = ["sqlmap", "nikto", "nmap", "masscan", "zgrab"]
            if any(agent in user_agent for agent in blocked_agents):
                response = JSONResponse(
                    status_code=403,
                    content={"status": "error", "message": "Forbidden"}
                )
                await response(scope, receive, send)
                return
            
            # Block requests with suspicious patterns
            path = request.url.path.lower()
            suspicious_patterns = ["../", "..\\", "%2e%2e", "script", "<script", "javascript:"]
            if any(pattern in path for pattern in suspicious_patterns):
                response = JSONResponse(
                    status_code=400,
                    content={"status": "error", "message": "Bad Request"}
                )
                await response(scope, receive, send)
                return
            
            # Enforce HTTPS in production
            if not settings.DEBUG:
                scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
                if scheme != "https":
                    response = JSONResponse(
                        status_code=403,
                        content={"status": "error", "message": "HTTPS required"}
                    )
                    await response(scope, receive, send)
                    return
        
        await self.app(scope, receive, send)

print("✦ Oracle Nexus initiating startup sequence...")
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# Add rate limiter to app
app.state.limiter = limiter

# Add rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return {"status": "error", "message": "Too many requests. Please try again later."}

# Add security headers middleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_with_headers(message):
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    # Add security headers
                    security_headers = [
                        (b"x-content-type-options", b"nosniff"),
                        (b"x-frame-options", b"DENY"),
                        (b"x-xss-protection", b"1; mode=block"),
                        (b"referrer-policy", b"strict-origin-when-cross-origin"),
                        (b"permissions-policy", b"accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"),
                    ]
                    # Add CSP in production
                    if not settings.DEBUG:
                        csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';"
                        security_headers.append((b"content-security-policy", csp.encode()))
                        security_headers.append((b"strict-transport-security", b"max-age=31536000; includeSubDomains"))
                    
                    headers.extend(security_headers)
                    message["headers"] = headers
                await send(message)
            
            await self.app(scope, receive, send_with_headers)
        else:
            await self.app(scope, receive, send)

# Add security middleware
app.add_middleware(SecurityMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Enable CORS for frontend integration
# Allowed origins defined in settings, but methods and headers broadly allowed
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with prefixes for clarity
app.include_router(auth)
app.include_router(results)
app.include_router(upload)
app.include_router(voice)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

def start():
    """Entry point for the backend server"""
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

if __name__ == "__main__":
    start()
