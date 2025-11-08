# 🎬 Reelio

**Reelio** is a professional, systemized AI solution for automatically generating polished YouTube Shorts–style videos from your text prompts. The tool unifies intelligent script generation, visual search and selection, voiceover synthesis, and video assembly into an efficient end-to-end workflow optimized for social platforms (portrait 1080x1920).

---

## ✨ Key Features

| Feature                                 | Description                                                                                            |
|------------------------------------------|--------------------------------------------------------------------------------------------------------|
| 🤖 **AI Script Generation**              | Structured, scene-based video scripts via custom Ollama "reelio" model                                 |
| 🎥 **Visual Sourcing**                   | Fetches scene-relevant video clips from Pixabay using generated keywords                               |
| 🎨 **User-Driven Visual Selection**      | Interactive selection: pick the best preview video for each scene                                      |
| 🎤 **Advanced Text-to-Speech**           | Produces natural voiceovers using RealtimeTTS and LM Studio                                            |
| 📐 **Format Enforcement**                | Automatic 1080x1920 portrait cropping for Shorts/Reels                                                |
| ⚡ **Streamlined Pipeline**               | From prompt input to social-ready video, all in a single command                                       |

---

## 🛠️ Planned Additions

| Feature                                   | Description                                                     |
|--------------------------------------------|-----------------------------------------------------------------|
| Automatic subtitles/captioning             | Generate accurate captions for videos automatically             |
| Background music track option              | Add background music layers to generated videos                  |
| Quick exports to social platforms          | One-click export to YouTube, TikTok, and other social apps      |
| Branding overlays (logo, outro, color)     | Add company branding as overlays, outros, or color schemes      |
| More media sources (beyond Pixabay)        | Support for additional stock media APIs and sources             |
| Voice cloning from sample                  | Mimic user-provided voice samples for narration                 |
| Desktop/web GUI                            | User-friendly graphical interface as desktop/web app            |
| Editable AI script before rendering        | Allow users to revise AI-generated video scripts                |

---

## 📦 Prerequisites

**Required:**
- Python **3.11+**
- **Ollama** (local, with custom "reelio" model)
- **LM Studio** (with `orpheus-3b-0.1-ft` TTS model)
- **Pixabay API Key** ([free here](https://pixabay.com/api/docs/))
- **FFmpeg** (used by MoviePy)

## ⚙️ Quick Setup

### 1. Clone & Enter Repository

```bash
git clone <repository-url>
cd Reelio
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Environment

- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### 4. Install All Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Secrets

Create a `.env` file in project root:
```env
PIXABAY_API_KEY=your_pixabay_api_key_here
```

---

### 6. Install Supporting Software

**Ollama**
- Download from [ollama.ai](https://ollama.ai)
- Create the "reelio" model:
  ```bash
  ollama create reelio -f Modelfile
  ```

**LM Studio**
- Download from [lmstudio.ai](https://lmstudio.ai)
- Search, download, and load model: `orpheus-3b-0.1-ft`
- Run LM Studio with model loaded

**FFmpeg**
- **Windows:** Download via [ffmpeg.org](https://ffmpeg.org/download.html) or:
  ```bash
  choco install ffmpeg
  ```
- **macOS:** `brew install ffmpeg`
- **Linux:** `sudo apt install ffmpeg`

---

## 🚀 Usage

1. **Ensure Ollama and LM Studio are running** with required models loaded.
2. **Run the script:**
   ```bash
   python main.py
   ```
3. **Respond to prompts:**
    - Enter your video topic/prompt (e.g., `"Explain quantum physics in simple terms"`)
    - Select your preferred visual for each scene interactively
4. **Find your completed video** in the `outputs/` directory.

#### Example Session

```bash
$ python main.py
Enter a prompt to generate a video: Explain quantum physics in simple terms
```

*Script workflow:*
1. Structured video plan (4 scenes) auto-generated
2. Relevant video previews fetched for each scene
3. Voiceovers synthesized using TTS
4. Visual assets downloaded & user selects best
5. Final video composed and saved

---

## 🗂️ Project Structure

```
Reelio/
├── main.py                  # Main operation script
├── models.py                # Output/model schemas (Pydantic)
├── generate_video.py        # Video composition logic
├── tts.py                   # Text-to-speech utilities
├── visuals.py               # Pixabay video handlers
├── Modelfile                # Ollama model spec
├── requirements.txt         # Python dependencies
├── utils/
│   ├── get_urls.py          # Pixabay integration
│   └── project_directory.py # Directory management
└── outputs/                 # Final videos (ignored by git)
```

---

## 💡 Technologies

| Component                 | Purpose                                     |
|---------------------------|---------------------------------------------|
| LangChain + Ollama        | Natural language prompt -> structured plan  |
| LM Studio + Orpheus       | Fast high-quality TTS generation            |
| RealtimeTTS               | Speech synthesis engine                     |
| MoviePy                   | Full video editing/composition pipeline     |
| Pixabay API               | Stock video clip sourcing                   |
| Pydantic                  | Typed/validated model schemas               |
| Python 3.11+              | Core language/runtime                       |

---

## 🛠️ Configuration & Customization

### 🤖 Ollama Model

- Defined in `Modelfile`
- Based on `gemma:2b`
- Structured JSON output for reliable automation

### 🗣️ LM Studio

- **Model:** `orpheus-3b-0.1-ft`
  - Install + run via LM Studio GUI
  - Ensure server is running (default local port)

### 🔑 API Keys

- **Pixabay**: Required as `PIXABAY_API_KEY` in `.env`
  - [Free API key registration](https://pixabay.com/api/docs/)

---

## 📈 How It Works – System Pipeline

1. **Prompt Intake:** User supplies natural language topic.
2. **Plan Generation:** Ollama model returns structured JSON plan with:
   - Title, description, 4 scenes (each with text + keywords)
3. **Visual Search:** Pixabay used to fetch 4 preview clips per scene.
4. **Audio Synthesis:** All voiceover scripts merged, then spoken via TTS.
5. **Visual Download:** Previews downloaded locally for selection.
6. **User Selection:** You pick the best visual for each scene.
7. **Video Assembly:** Final, portrait-formatted video output with audio & chosen visuals.

---

## 🔍 Troubleshooting

| Issue                      | Solution                                                                                 |
|----------------------------|-----------------------------------------------------------------------------------------|
| **Ollama model not found** | Verify "reelio" model creation with: `ollama create reelio -f Modelfile`                |
| **LM Studio issues**       | Ensure LM Studio is running with `orpheus-3b-0.1-ft` loaded, server running             |
| **Pixabay API error**      | Confirm the API key in `.env` is valid                                                  |
| **FFmpeg errors**          | Check FFmpeg is installed & available in your PATH                                      |
| **TTS audio issues**       | Ensure RealtimeTTS dependencies are installed & LM Studio is up, model loaded           |

---

## 🤝 Contributing

We welcome improvements and suggestions. Please submit Pull Requests or open Issues to help advance Reelio.

---

<div align="center">

**Made with ❤️ for content creators**

</div>
