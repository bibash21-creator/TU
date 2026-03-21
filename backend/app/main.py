from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, results, upload, voice

app = FastAPI(title="Nova Oracle API", version="2.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth)
app.include_router(results)
app.include_router(upload)
app.include_router(voice)

@app.get("/")
async def root():
    return {
        "message": "Nova Oracle API is online. Modular version.",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=9099, reload=True)
