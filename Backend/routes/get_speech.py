from fastapi import APIRouter
from models import ReelioVideoPlan
from core.generate_speech import generate_speech
from utils.colors import NEON_BLUE, RESET_COLOR

router = APIRouter()

@router.post("/")
def generate_speech_endpoint(request: ReelioVideoPlan):
    response = generate_speech(request)
    audio_url = f"http://127.0.0.1:8000/{response.audio_path}"
    response.audio_url = audio_url
    print(f"{NEON_BLUE}Response: {response}{RESET_COLOR}")
    return response
