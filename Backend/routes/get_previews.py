from fastapi import APIRouter
from models import ReelioVideoPlan
from core.generate_urls import get_pixabay_urls
from utils.colors import NEON_BLUE, RESET_COLOR

router = APIRouter()  # ⚡ separate router

@router.post("/")  # POST because we send JSON
def get_urls(response: ReelioVideoPlan):
    for scene in response.scenes:
        scene.preview_urls = get_pixabay_urls(scene.keyword)

    print(f"{NEON_BLUE}Response: {response}{RESET_COLOR}")
    return response
