import os
import requests
from urllib.parse import urlparse
from utils.project_directory import get_project_dir
from models import ReelioVideoPlan

def download_file(url: str, dest_dir: str, scene_num: int, index: int):
    """Download a single file and rename it in a structured way."""
    try:
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1]

        if not ext:
            ext = ".mp4" if "video" in url else ".jpg"

        file_type = "video" if ext.lower() in [".mp4", ".mov", ".avi", ".webm"] else "image"
        file_name = f"scene{scene_num}_{file_type}{index}{ext}"
        file_path = os.path.join(dest_dir, file_name)

        if os.path.exists(file_path):
            return file_path

        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return file_path
    except Exception as e:
        print(f"[⚠️] Failed to download {url}: {e}")
        return None


def download_visuals(response: ReelioVideoPlan):
    """
    Download only the selected_url for each scene, update downloaded_files,
    and keep only that URL in preview_urls.
    
    Args:
        video_plan: ReelioVideoPlan object
    """
    project_dir = get_project_dir(response.title)

    for scene_num, scene in enumerate(response.scenes, start=1):
        selected_url = getattr(scene, "selected_url", None)
        if selected_url:
            file_path = download_file(selected_url, project_dir, scene_num, 1)
            if file_path:
                scene.downloaded_files = [file_path]
                scene.preview_urls = [selected_url]  # keep only the selected URL
            else:
                scene.downloaded_files = []
                scene.preview_urls = []
        else:
            scene.downloaded_files = []
            scene.preview_urls = []

    return response
