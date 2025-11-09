from fastapi import APIRouter
from pydantic import BaseModel
from core.generate_response import generate_response

router = APIRouter()  # ⚡ separate router

class Prompt(BaseModel):
    prompt: str

@router.post("/")
def generate_script(data: Prompt):
    return generate_response(data.prompt)
