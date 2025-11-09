from fastapi import APIRouter
from models import ReelioVideoPlan
from core.generate_video import get_video

router = APIRouter()

@router.post("/")
def generate_video_endpoint(response: ReelioVideoPlan):
    response = get_video(response)
    return response
