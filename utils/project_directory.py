import os

BASE_DIR = "outputs"

def get_project_dir(title: str) -> str:
    title = "".join("_" if not c.isalnum() else c for c in title)
    os.makedirs(os.path.join(BASE_DIR, title), exist_ok=True)
    return os.path.join(BASE_DIR, title)