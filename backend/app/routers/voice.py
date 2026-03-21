from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import Optional
import edge_tts

router = APIRouter(tags=["voice"])

@router.get("/voice")
async def get_voice(text: str, lang: Optional[str] = "en"):
    """Generate and stream neural voice audio using edge-tts"""
    voice = "en-GB-SoniaNeural" if lang == "en" else "ne-NP-HemkalaNeural"
    # Sonia is very natural and clear, Hemkala is the default for Nepali
    
    communicate = edge_tts.Communicate(text, voice, rate="+0%", pitch="+0Hz")
    
    async def audio_generator():
        async for chunk in communicate.stream():
            if chunk["data"]:
                yield chunk["data"]
                
    return StreamingResponse(audio_generator(), media_type="audio/mpeg")
