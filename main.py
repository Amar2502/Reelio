from langchain_ollama import ChatOllama
from tts import generate_speech
from visuals import download_visuals
from models import ReelioVideoPlan
from utils.get_urls import get_pixabay_urls 
import re
import os
import shutil
from generate_video import generate_video

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
        scene.preview_urls = get_pixabay_urls(scene.keyword)
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

    print(f"{NEON_GREEN}Select Best Visual For Each Scene...{RESET_COLOR}")
    best_visuals = []
    for index, scene in enumerate(response.scenes, start=1):
        print(f"{NEON_GREEN}Visuals For Scene {index}:{RESET_COLOR}")
        for i, file in enumerate(scene.downloaded_files, start=1):
            print(f"  {i}. {file}")
        while True:
            best_visual = input(f"{NEON_GREEN}Enter the number of the best visual for Scene {index}: {RESET_COLOR}")
            try:
                selection = int(best_visual)
                if 1 <= selection <= len(scene.downloaded_files):
                    best_visuals.append(scene.downloaded_files[selection - 1])
                    break
                else:
                    print(f"{NEON_GREEN}Please enter a number between 1 and {len(scene.downloaded_files)}.{RESET_COLOR}")
            except ValueError:
                print(f"{NEON_GREEN}Invalid input. Please enter a number.{RESET_COLOR}")
    print(f"{NEON_GREEN}Best Visuals Selected{RESET_COLOR}")

    print(f"{NEON_GREEN}Deleting Unused Visuals...{RESET_COLOR}")
    for file in downloaded_visuals:
        if file not in best_visuals:
            os.remove(file)
    print(f"{NEON_GREEN}Unused Visuals Deleted{RESET_COLOR}")

    for index, scene in enumerate(response.scenes):
        scene.downloaded_files = best_visuals[index]
    print(f"{NEON_GREEN}Visuals Grouped{RESET_COLOR}")

    print(f"{NEON_GREEN}Renaming Visuals...{RESET_COLOR}")
    for index, scene in enumerate(response.scenes, start=1):
        file_path = scene.downloaded_files
        if not os.path.exists(file_path):
            continue

        _, ext = os.path.splitext(file_path)
        new_name = f"scene{index}{ext}"
        dir_name = os.path.dirname(file_path)
        new_path = os.path.join(dir_name, new_name)
        if os.path.exists(new_path):
            os.remove(new_path)
        shutil.move(file_path, new_path)
        scene.downloaded_files = new_path
        best_visuals[index-1] = new_path
    print(f"{NEON_GREEN}Visuals Renamed{RESET_COLOR}")

    print(f"{NEON_BLUE}{response.title_suggestion}{RESET_COLOR}")
    print(f"{NEON_BLUE}{response.description}{RESET_COLOR}")
    print(f"{NEON_BLUE}{response.total_estimated_time}{RESET_COLOR}\n")
    for scene in response.scenes:
        print(f"{NEON_BLUE}{scene.keyword}{RESET_COLOR}")
        print(f"{NEON_BLUE}{scene.voiceover}{RESET_COLOR}")
        print(f"{NEON_BLUE}{scene.downloaded_files}{RESET_COLOR}")
        print("\n")
    print(f"{NEON_BLUE}{audio_path}{RESET_COLOR}")

if __name__ == "__main__":
    prompt = input("Enter a prompt to generate a video: ")
    result = create_video_from_prompt(prompt)
    print(result)