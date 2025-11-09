import os

BASE_DIR = "outputs"

def gate_safe_title(title: str) -> str:
    return "".join("_" if not c.isalnum() else c for c in title)

def get_project_dir(title: str) -> str:
    title = gate_safe_title(title)
    os.makedirs(os.path.join(BASE_DIR, title), exist_ok=True)
    return os.path.join(BASE_DIR, title)

def get_final_video_path(title: str) -> str:
    title = gate_safe_title(title)
    return os.path.join(BASE_DIR, f"{title}.mp4")