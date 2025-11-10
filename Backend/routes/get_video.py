from fastapi import APIRouter
from models import ReelioVideoPlan
from core.generate_video import get_video
from utils.colors import NEON_BLUE, RESET_COLOR

router = APIRouter()

@router.post("/")
def generate_video_endpoint(response: ReelioVideoPlan):
    response = get_video(response)
    final_video_url = f"http://127.0.0.1:8000/{response.final_video_path}"
    response.final_video_url = final_video_url
    print(f"{NEON_BLUE}Response: {response}{RESET_COLOR}")
    return response
