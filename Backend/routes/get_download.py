from fastapi import APIRouter
from models import ReelioVideoPlan
from core.download_visuals import download_visuals

router = APIRouter()

@router.post("/")
def download_visuals_endpoint(response: ReelioVideoPlan):
    """
    Downloads selected_url for each scene,
    and returns the updated response with downloaded_files updated.
    """
    response = download_visuals(response)
    return response
