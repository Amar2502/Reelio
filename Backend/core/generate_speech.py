from RealtimeTTS import TextToAudioStream, OrpheusEngine, OrpheusVoice
from utils.project_directory import get_project_dir
from models import ReelioVideoPlan
import os

def generate_speech(response: ReelioVideoPlan):
    
    engine = OrpheusEngine()
    stream = TextToAudioStream(engine)

    # Initialize system (muted)
    stream.feed("System initialized successfully.")
    stream.play(muted=True)

    voice = OrpheusVoice(response.voice_name)
    engine.set_voice(voice)

    # Concatenate all voiceover texts
    combined_text = "\n".join([scene.voiceover for scene in response.scenes])
    stream.feed(combined_text)

    # Output path
    output_file = os.path.join(get_project_dir(response.title), "voiceover.wav")
    stream.play(output_wavfile=output_file, muted=True)

    response.audio_path = output_file

    return response
