from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional
import edge_tts
import hashlib
import os
import asyncio
from app.utils.nepali_voice import generate_nepali_script, generate_short_nepali_script

router = APIRouter(tags=["voice"])

# Cache directory for audio files
CACHE_DIR = "/tmp/voice_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cache_key(text: str, voice: str) -> str:
    """Generate cache key for audio file"""
    content = f"{text}:{voice}"
    return hashlib.md5(content.encode()).hexdigest()

async def generate_audio_file(text: str, voice: str, rate: str, output_path: str):
    """Generate audio file and save to cache"""
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch="+0Hz")
    
    with open(output_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio" and chunk.get("data"):
                f.write(chunk["data"])

@router.get("/voice")
async def get_voice(text: str, lang: Optional[str] = "en"):
    """Generate and stream high-quality female neural voice audio using edge-tts"""
    
    # Human-like flow tuning
    voice_rate = "-10%" if lang == "en" else "-12%"
    voice = "en-US-AvaNeural" if lang == "en" else "ne-NP-HemkalaNeural"
    
    # Check cache first
    cache_key = get_cache_key(text, voice)
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
    
    if os.path.exists(cache_path):
        # Serve from cache
        async def cached_audio_generator():
            with open(cache_path, "rb") as f:
                while chunk := f.read(8192):
                    yield chunk
        return StreamingResponse(cached_audio_generator(), media_type="audio/mpeg")
    
    # Generate new audio
    communicate = edge_tts.Communicate(text, voice, rate=voice_rate, pitch="+0Hz")
    
    async def audio_generator():
        audio_data = bytearray()
        try:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio" and chunk.get("data"):
                    audio_data.extend(chunk["data"])
                    yield chunk["data"]
            
            # Save to cache after generation
            with open(cache_path, "wb") as f:
                f.write(audio_data)
        except Exception as e:
            print(f"[Voice Engine Error] {e}")
            
    return StreamingResponse(audio_generator(), media_type="audio/mpeg")

@router.post("/announce")
async def generate_announcement(student_data: dict, short: bool = False, lang: str = "np"):
    """
    Generate Nepali announcement script and audio for student result
    
    Request body: student result data
    Response: script text + audio URL
    """
    try:
        # Generate script
        if short:
            script = generate_short_nepali_script(student_data)
        else:
            script = generate_nepali_script(student_data)
        
        text_to_speak = script["nepali_text"] if lang == "np" else script["english_text"]
        
        # Generate cache key
        voice = "ne-NP-HemkalaNeural" if lang == "np" else "en-US-AvaNeural"
        voice_rate = "-12%" if lang == "np" else "-10%"
        cache_key = get_cache_key(text_to_speak, voice)
        cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
        
        # Generate audio if not cached
        if not os.path.exists(cache_path):
            await generate_audio_file(text_to_speak, voice, voice_rate, cache_path)
        
        # Return script and audio URL
        return {
            "status": "success",
            "script": script,
            "audio_url": f"/voice/cached/{cache_key}.mp3",
            "cached": os.path.exists(cache_path)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Announcement generation failed: {str(e)}")

@router.get("/voice/cached/{filename}")
async def get_cached_voice(filename: str):
    """Serve cached audio file"""
    cache_path = os.path.join(CACHE_DIR, filename)
    
    if not os.path.exists(cache_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    
    async def file_generator():
        with open(cache_path, "rb") as f:
            while chunk := f.read(8192):
                yield chunk
    
    return StreamingResponse(file_generator(), media_type="audio/mpeg")
