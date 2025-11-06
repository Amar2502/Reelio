from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field
from typing import Literal, List
import requests
from dotenv import load_dotenv
import os
from tts import generate_speech
from visuals import download_visuals

# === COLORS ===
NEON_GREEN = "\033[92m"
RESET_COLOR = "\033[0m"
NEON_BLUE = "\033[94m"

# === Load Environment Variables ===
load_dotenv()
PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY")
if not PIXABAY_API_KEY:
    raise ValueError("Pixabay API key not found in environment variables.")

# === Model Setup ===
model = ChatOllama(model="reelio")

# === Data Schemas ===

class Scene(BaseModel):
    time_range: str = Field(description="e.g. '0-10 seconds'")
    visual_type: Literal["image", "video"] = Field(description="Type of visual (image or video)")
    voiceover: str = Field(description="Voiceover script for this scene")
    keyword: str = Field(description="Keyword for Pixabay search")
    preview_urls: List[str] = Field(default_factory=list)

class ReelioVideoPlan(BaseModel):
    title_suggestion: str = Field(description="Title suggestion for the video")
    total_estimated_time: str = Field(description="Total estimated duration of the video")
    description: str = Field(description="Description of the video")
    scenes: List[Scene] = Field(default_factory=list)

structured_model = model.with_structured_output(ReelioVideoPlan)

# === Pixabay Helper ===
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

# === Core Generation Pipeline ===
def create_video_from_prompt(prompt: str):
    """Generates a complete video (plan, visuals, audio, final video) from a text prompt."""

    print(f"{NEON_BLUE}Generating video plan...{RESET_COLOR}")
    response = structured_model.invoke(prompt)
    print(f"{NEON_GREEN}Video plan generated successfully.{RESET_COLOR}")

    print(f"{NEON_BLUE}Title suggestion: {response.title_suggestion}{RESET_COLOR}")
    print(f"{NEON_BLUE}Total estimated time: {response.total_estimated_time}{RESET_COLOR}")
    print(f"{NEON_BLUE}Description: {response.description}{RESET_COLOR}")
    for scene in response.scenes:
        print(f"{NEON_BLUE}Time range: {scene.time_range}{RESET_COLOR}")
        print(f"{NEON_BLUE}Visual type: {scene.visual_type}{RESET_COLOR}")
        print(f"{NEON_BLUE}Keyword: {scene.keyword}{RESET_COLOR}")
        print(f"{NEON_BLUE}Preview URLs: {scene.preview_urls}{RESET_COLOR}")
        print(f"{NEON_BLUE}--------------------------------{RESET_COLOR}")

    # Populate preview URLs for each scene
    print(f"{NEON_BLUE}Populating preview URLs for each scene...{RESET_COLOR}")
    for scene in response.scenes:
        scene.preview_urls = get_pixabay_urls(scene.visual_type, scene.keyword)

    for url in scene.preview_urls:
        print(f"{NEON_BLUE}Preview URL: {url}{RESET_COLOR}")
        print(f"{NEON_BLUE}--------------------------------{RESET_COLOR}")
    print(f"{NEON_GREEN}Preview URLs populated successfully.{RESET_COLOR}")

    # Combine all voiceovers into one narration
    print(f"{NEON_BLUE}Combining all voiceovers into one narration...{RESET_COLOR}")
    accumulated_voiceover = " ".join(scene.voiceover for scene in response.scenes)
    print(f"{NEON_BLUE}Accumulated voiceover: {accumulated_voiceover}{RESET_COLOR}")
    print(f"{NEON_GREEN}Voiceover combined successfully.{RESET_COLOR}")

    # Generate audio
    print(f"{NEON_BLUE}Generating audio...{RESET_COLOR}")
    audio_path = generate_speech(response.title_suggestion, accumulated_voiceover)
    print(f"{NEON_GREEN}Audio generated successfully.{RESET_COLOR}")

    # Download visuals
    print(f"{NEON_BLUE}Downloading visuals...{RESET_COLOR}")
    downloaded_visuals = download_visuals(response.title_suggestion, response.scenes)
    print(f"{NEON_GREEN}Visuals downloaded successfully.{RESET_COLOR}")

    return {
        "plan": response.model_dump(),
        "audio_path": audio_path,
        "visuals": downloaded_visuals
    }

if __name__ == "__main__":
    # Example usage
    prompt = "Make a a60 sec script explaining neutron stars"
    result = create_video_from_prompt(prompt)
    print(result)