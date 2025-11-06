from langchain_ollama import ChatOllama
from tts import generate_speech
from visuals import download_visuals
from models import ReelioVideoPlan
from utils.get_urls import get_pixabay_urls

model = ChatOllama(model="reelio")

structured_model = model.with_structured_output(ReelioVideoPlan)


# Core generation pipeline
def create_video_from_prompt(prompt: str):

    response = structured_model.invoke(prompt)
    print("Response Generated")

    for scene in response.scenes:
        scene.preview_urls = get_pixabay_urls(scene.visual_type, scene.keyword)
    print("Preview URLs Generated")

    accumulated_voiceover = " ".join(scene.voiceover for scene in response.scenes)
    print("Accumulated Voiceover Generated")

    audio_path = generate_speech(response.title_suggestion, accumulated_voiceover)
    print("Audio Generated")

    downloaded_visuals = download_visuals(response.title_suggestion, response.scenes)
    print("Visuals Downloaded")

    return {
        "plan": response.model_dump(),
        "audio_path": audio_path,
        "visuals": downloaded_visuals
    }

if __name__ == "__main__":
    prompt = input("Enter a prompt to generate a video: ")
    result = create_video_from_prompt(prompt)
    print(result)