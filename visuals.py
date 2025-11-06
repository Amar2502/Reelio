import os
import requests
from urllib.parse import urlparse
from typing import List
from utils.project_directory import get_project_dir
from models import Scene

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
    except Exception:
        return None


def download_visuals(title: str, scenes: List[Scene]):
    
    project_dir = get_project_dir(title)
    downloaded_files = []

    for scene_num, scene in enumerate[Scene](scenes, start=1):
        for index, url in enumerate[str](scene.preview_urls, start=1):
            file_path = download_file(url, project_dir, scene_num, index)
            if file_path:
                downloaded_files.append(file_path)

    return downloaded_files
