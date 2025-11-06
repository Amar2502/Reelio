from pydantic import BaseModel, Field
from typing import Literal, List

class Scene(BaseModel):
    time_range: str = Field(description="e.g. '0-10 seconds'")
    visual_type: Literal["image", "video"] = Field(description="Type of visual (image or video)")
    voiceover: str = Field(description="Voiceover script for this scene")
    keyword: str = Field(description="Keyword for Pixabay search")
    preview_urls: List[str] = Field(default_factory=list)

class ReelioVideoPlan(BaseModel):
    title_suggestion: str = Field(description="Title suggestion for the video")
    total_estimated_time: str = Field(description="Total estimated duration of the video")
    description: str = Field(description="Description of the video")
    scenes: List[Scene] = Field(default_factory=list)