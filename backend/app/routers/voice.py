from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import Optional
import edge_tts

router = APIRouter(tags=["voice"])

@router.get("/voice")
async def get_voice(text: str, lang: Optional[str] = "en"):
    """Generate and stream high-quality female neural voice audio using edge-tts"""
    
    # Human-like flow tuning
    voice_rate = "-10%" if lang == "en" else "-12%"
    voice = "en-US-AvaNeural" if lang == "en" else "ne-NP-HemkalaNeural"
    
    communicate = edge_tts.Communicate(text, voice, rate=voice_rate, pitch="+0Hz")
    
    async def audio_generator():
        try:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio" and chunk.get("data"):
                    yield chunk["data"]
        except Exception as e:
            print(f"[Voice Engine Error] {e}")
            
    return StreamingResponse(audio_generator(), media_type="audio/mpeg")
