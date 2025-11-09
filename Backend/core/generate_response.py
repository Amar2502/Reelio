from langchain_ollama import ChatOllama
from models import ReelioVideoPlan
from utils.colors import NEON_GREEN, RESET_COLOR

model = ChatOllama(model="reelio")

structured_model = model.with_structured_output(ReelioVideoPlan)


def generate_response(prompt: str):
    print(f"{NEON_GREEN}Generating Response...{RESET_COLOR}")
    response = structured_model.invoke(prompt)
    return response