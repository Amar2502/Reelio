# 🎬 **Reelio: Instantly Turn Ideas into YouTube Shorts!**

> **Transform prompts into viral Shorts — fully automated with AI-generated scripts, voiceovers, visuals, and video assembly.**

---

## ✨ **Features**

| Feature                                 | Description                       |
|------------------------------------------|-----------------------------------|
| **AI-powered script breakdown**          | Ollama integration                |
| **Automatic stock visuals**              | Pixabay integration               |
| **Realistic AI voiceover**               | LM Studio                         |
| **Portrait 1080x1920 exports**           | Ready to post                     |
| **One-click launch**                     | Windows batch supported           |

### 🛠️ *Upcoming Features*

| Feature                                 | Description                                |
|------------------------------------------|--------------------------------------------|
| **Text-to-animated video generator**     | Bring scripts to life with AI animation    |
| **Custom voice cloning**                 | Use your own voice for narration           |
| **Advanced subtitle styling**            | Enhanced readable, brandable subtitles     |
| **Built-in YouTube upload**              | Instantly upload shorts to your channel    |


---

## 🚀 **Quick Start**

### 🔹 **Automated (Windows)**
Just double-click:

```bash
start_all.bat
```
This launches Ollama, backend, frontend, and LM Studio for you.

**_Before you start:_**
  - Install: **Python**, **Node.js**, **Ollama**, **LM Studio**, **FFmpeg**
  - Add your Pixabay API key to:  
    ```ini
    Backend/.env
    ```
    as  
    ```ini
    PIXABAY_API_KEY=YOUR_KEY_HERE
    ```

---

### 🔹 **Manual Setup (Cross-Platform)**

#### 1. **Clone & Set Up Backend**

```bash
git clone https://github.com/Amar2502/Reelio.git
cd Reelio/Backend
python -m venv venv
venv/Scripts/activate   # On Windows
# OR
source venv/bin/activate # On Mac/Linux

pip install -r requirements.txt
```

#### 2. **Set Up Frontend**
```bash
cd ../frontend
npm install
```

#### 3. **Model Download/Load (LM Studio)**
- Download the `orpheus-3b-0.1-ft` model and load it in LM Studio.

#### 4. **Prepare Ollama Model**
```bash
ollama create reelio -f ../Backend/Modelfile
```

#### 5. **Run Everything**
```bash
# In separate terminals:
ollama serve

# Backend:
cd ../Backend
venv/Scripts/activate && uvicorn server:app --reload
# OR
source venv/bin/activate && uvicorn server:app --reload

# Frontend:
cd ../frontend
npm run dev

# LM Studio:
# Launch app and load 'orpheus-3b-0.1-ft' model
```

#### 6. **Visit the App**
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 **How to Use Reelio**

1. 💡 **Type your idea/prompt**
2. 📝 **Review and refine AI-generated script/scenes**
3. 🖼️ **Select visuals for each scene**
4. 🎤 **Generate video with auto voiceover**
5. 📥 **Download from `Backend/outputs/`**

---
---

**Made with ❤️ for creators and storytellers!**

🌟 _Love Reelio? Star the repo and share your creations!_
