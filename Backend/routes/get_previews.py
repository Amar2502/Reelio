from fastapi import APIRouter
from models import ReelioVideoPlan
from core.generate_urls import get_pixabay_urls

router = APIRouter()  # ⚡ separate router

@router.post("/")  # POST because we send JSON
def get_urls(response: ReelioVideoPlan):
    for scene in response.scenes:
        scene.preview_urls = get_pixabay_urls(scene.keyword)
    return response
