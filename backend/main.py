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

# Add security middleware
app.add_middleware(SecurityMiddleware)

# Enable CORS for frontend integration
# More restrictive in production
allow_methods = ["GET", "POST", "DELETE"] if not settings.DEBUG else ["*"]
allow_headers = ["Content-Type", "Authorization", "X-Admin-Token"] if not settings.DEBUG else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=allow_methods,
    allow_headers=allow_headers,
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
