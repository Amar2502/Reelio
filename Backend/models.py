from pydantic import BaseModel, Field
from typing import List

class Scene(BaseModel):
    voiceover: str = Field(description="Voiceover script for this scene")
    keyword: List[str] = Field(default_factory=lambda: ["example_keyword"], min_items=1, max_items=3)
    preview_urls: List[str] = Field(default_factory=list)
    selected_url: str = Field(default="", description="Selected URL for the scene")
    downloaded_files: List[str] = Field(default_factory=list)

class ReelioVideoPlan(BaseModel):
    title: str = Field(description="Title suggestion for the video, catchy and seo friendly")
    total_estimated_time: str = Field(description="Total estimated duration of the video")
    description: str = Field(description="Description of the video, that can be used to post on youtube with hashtags and all")
    scenes: List[Scene] = Field(default_factory=lambda: [Scene() for _ in range(4)], min_items=4, max_items=4)
    voice_name: str = Field(description="Name of the voice used to generate the video")
    audio_url: str = Field(description="Path to the generated audio file")
    audio_path: str = Field(description="Path to the generated audio file")
    final_video_url: str = Field(description="Path to the final video file")
    final_video_path: str = Field(description="Path to the final video file")