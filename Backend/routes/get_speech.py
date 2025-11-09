from fastapi import APIRouter
from models import ReelioVideoPlan
from core.generate_speech import generate_speech

router = APIRouter()

@router.post("/")
def generate_speech_endpoint(request: ReelioVideoPlan):
    response = generate_speech(request)
    return response
