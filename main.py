from langchain_ollama import ChatOllama
from tts import generate_speech
from visuals import download_visuals
from models import ReelioVideoPlan
from utils.get_urls import get_pixabay_urls
import re

NEON_BLUE = "\033[38;2;0;255;255m"      # Cyan-like blue
NEON_GREEN = "\033[38;2;57;255;20m"     # Bright green
RESET_COLOR = "\033[0m" 

model = ChatOllama(model="reelio")

structured_model = model.with_structured_output(ReelioVideoPlan)

# Core generation pipeline
def create_video_from_prompt(prompt: str):

    print(f"{NEON_GREEN}Generating Response...{RESET_COLOR}")
    response = structured_model.invoke(prompt)
    print(f"{NEON_GREEN}Response Generated{RESET_COLOR}")

    print(f"{NEON_GREEN}Generating Preview URLs...{RESET_COLOR}")
    for scene in response.scenes:
        scene.preview_urls = get_pixabay_urls(scene.visual_type, scene.keyword)
    print(f"{NEON_GREEN}Preview URLs Generated{RESET_COLOR}")

    print(f"{NEON_GREEN}Generating Accumulated Voiceover...{RESET_COLOR}")
    accumulated_voiceover = " ".join(scene.voiceover for scene in response.scenes)
    print(f"{NEON_GREEN}Accumulated Voiceover Generated{RESET_COLOR}")

    print(f"{NEON_GREEN}Generating Audio...{RESET_COLOR}")
    audio_path = generate_speech(response.title_suggestion, accumulated_voiceover)
    print(f"{NEON_GREEN}Audio Generated{RESET_COLOR}")

    print(f"{NEON_GREEN}Downloading Visuals...{RESET_COLOR}")
    downloaded_visuals = download_visuals(response.title_suggestion, response.scenes)
    print(f"{NEON_GREEN}Visuals Downloaded{RESET_COLOR}")


    print(f"{NEON_GREEN}Grouping Visuals...{RESET_COLOR}")
    for index, scene in enumerate(response.scenes, start=1):
        pattern = fr"scene{index}_"
        scene.downloaded_files = [
            v for v in downloaded_visuals   
            if re.search(pattern, v)
    ]
    print(f"{NEON_GREEN}Visuals Grouped{RESET_COLOR}")

    print(f"{NEON_BLUE}Title: {response.title_suggestion}{RESET_COLOR}\n")
    print(f"{NEON_BLUE}Total Estimated Time: {response.total_estimated_time}{RESET_COLOR}\n")
    print(f"{NEON_BLUE}Description: {response.description}{RESET_COLOR}\n")
    for scene in response.scenes:
        print(f"{NEON_BLUE}Visual Type: {scene.visual_type}{RESET_COLOR}")
        print(f"{NEON_BLUE}Keyword: {scene.keyword}{RESET_COLOR}")
        print(f"{NEON_BLUE}Voiceover: {scene.voiceover}{RESET_COLOR}")
        print(f"{NEON_BLUE}Downloaded Files: {scene.downloaded_files}{RESET_COLOR}")
        print("\n")
    print(f"{NEON_BLUE}Audio Path: {audio_path}{RESET_COLOR}")


if __name__ == "__main__":
    prompt = input("Enter a prompt to generate a video: ")
    result = create_video_from_prompt(prompt)
    print(result)