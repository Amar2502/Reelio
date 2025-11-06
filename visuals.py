import os
import requests
from urllib.parse import urlparse
from typing import List
from pydantic import BaseModel, Field
from typing import Literal

BASE_DIR = "outputs"


class Scene(BaseModel):
    time_range: str = Field(description="e.g. '0-10 seconds'")
    visual_type: Literal["image", "video"] = Field(description="Type of visual (image or video)")
    voiceover: str = Field(description="Voiceover script for this scene")
    keyword: str = Field(description="Keyword for Pixabay search")
    preview_urls: List[str] = Field(default_factory=list)


def get_project_dir(title: str) -> str:
    """Create a folder for the given video title in the current directory."""
    title = "".join("_" if not c.isalnum() else c for c in title)
    os.makedirs(os.path.join(BASE_DIR, title), exist_ok=True)
    return os.path.join(BASE_DIR, title)


def download_file(url: str, dest_dir: str, scene_num: int, index: int):
    """Download a single file and rename it in a structured way."""
    try:
        # Extract file extension safely
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1]
        if not ext:
            ext = ".mp4" if "video" in url else ".jpg"

        # Guess type from extension
        file_type = "video" if ext.lower() in [".mp4", ".mov", ".avi", ".webm"] else "image"

        # Create formatted filename like: scene1_image1.jpg
        file_name = f"scene{scene_num}_{file_type}{index}{ext}"
        file_path = os.path.join(dest_dir, file_name)

        # Skip if already downloaded
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
    """Download multiple visuals for a video title into its own folder."""
    project_dir = get_project_dir(title)
    downloaded_files = []

    for scene_num, scene in enumerate(scenes, start=1):
        for index, url in enumerate(scene.preview_urls, start=1):
            file_path = download_file(url, project_dir, scene_num, index)
            if file_path:
                downloaded_files.append(file_path)

    return downloaded_files
