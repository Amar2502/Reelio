from RealtimeTTS import TextToAudioStream, OrpheusEngine, OrpheusVoice
import os

BASE_DIR = "outputs"

def get_project_dir(title: str) -> str:
    """Create a folder for the given video title in the current directory."""
    title = "".join("_" if not c.isalnum() else c for c in title)
    os.makedirs(os.path.join(BASE_DIR, title), exist_ok=True)
    return os.path.join(BASE_DIR, title)

def generate_speech(title: str, text: str, voice_name: str = "tara") -> str:
    """Generate speech from text and save it as a .wav file safely."""

    engine = OrpheusEngine()
    stream = TextToAudioStream(engine)

    # Warm up the system (helps avoid first-line cutoffs)
    stream.feed("System initialized successfully.")
    stream.play(muted=True)

    # Set voice
    voice = OrpheusVoice(voice_name)
    engine.set_voice(voice)

    # Feed and generate speech
    stream.feed(text)
    stream.play(output_wavfile=os.path.join(get_project_dir(title), "voiceover.wav"))

    return os.path.join(get_project_dir(title), "voiceover.wav")