from RealtimeTTS import TextToAudioStream, OrpheusEngine, OrpheusVoice
from utils.project_directory import get_project_dir
import os

def generate_speech(title: str, text: str, voice_name: str = "tara") -> str:

    engine = OrpheusEngine()
    stream = TextToAudioStream(engine)

    stream.feed("System initialized successfully.")
    stream.play(muted=True)
    
    voice = OrpheusVoice(voice_name)
    engine.set_voice(voice)

    stream.feed(text)
    stream.play(output_wavfile=os.path.join(get_project_dir(title), "voiceover.wav"), muted=True)

    return os.path.join(get_project_dir(title), "voiceover.wav")