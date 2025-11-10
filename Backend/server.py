from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.get_script import router as generate_router
from routes.get_previews import router as urls_router
from routes.get_download import router as download_router
from routes.get_speech import router as audio_router
from routes.get_video import router as video_router
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Reelio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # or ["http://localhost:3000"] for stricter policy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

outputs_dir = os.path.join(os.getcwd(), "outputs")
app.mount("/outputs", StaticFiles(directory=outputs_dir), name="outputs")

# include separate routers
app.include_router(generate_router, prefix="/generate_script", tags=["Generate Script"])
app.include_router(urls_router, prefix="/get_previews", tags=["Get URLs"])
app.include_router(download_router, prefix="/download_selected_visuals", tags=["Download Selected Visuals"])
app.include_router(audio_router, prefix="/generate_audio", tags=["Generate Audio"])
app.include_router(video_router, prefix="/generate_video", tags=["Generate Video"])

@app.get("/")
def root():
    return {"message": "Welcome to Reelio API!"}
