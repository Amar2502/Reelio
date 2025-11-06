import requests
from typing import Literal, List
from dotenv import load_dotenv
import os

load_dotenv()
PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY")
if not PIXABAY_API_KEY:
    raise ValueError("Pixabay API key not found in environment variables.")


def get_pixabay_urls(visual_type: Literal["image", "video"], keyword: str) -> List[str]:
    try:
        if visual_type == "image":
            url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={keyword}&image_type=photo&per_page=4"
        elif visual_type == "video":
            url = f"https://pixabay.com/api/videos/?key={PIXABAY_API_KEY}&q={keyword}&per_page=4"
        else:
            return []

        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        hits = data.get("hits", [])

        if not hits:
            return []

        if visual_type == "image":
            return [hit["largeImageURL"] for hit in hits]
        else:
            return [hit["videos"]["large"]["url"] for hit in hits]
    except Exception:
        return []