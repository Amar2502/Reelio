from pydantic import BaseModel, Field
from typing import Literal, List

class Scene(BaseModel):
    visual_type: Literal["image", "video"] = Field(description="Type of visual (image or video)")
    voiceover: str = Field(description="Voiceover script for this scene")
    keyword: str = Field(description="Keyword for Pixabay search, keyowrds should be different for every scene")
    preview_urls: List[str] = Field(default_factory=list)
    downloaded_files: List[str] = Field(default_factory=list)

class ReelioVideoPlan(BaseModel):
    title_suggestion: str = Field(description="Title suggestion for the video, catchy and seo friendly")
    total_estimated_time: str = Field(description="Total estimated duration of the video")
    description: str = Field(description="Description of the video, that can be used to post on youtube with hashtags and all")
    scenes: List[Scene] = Field(default_factory=lambda: [Scene() for _ in range(4)], min_items=4, max_items=4)