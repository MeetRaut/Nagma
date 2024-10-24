# app/chatbot/chatbot.py

from .nagma_chatbot import NagmaChatbot
from .config import DATA_PATH  # Use relative import

class ChatbotService:
    def __init__(self):
        self.chatbot = NagmaChatbot(DATA_PATH)

    def get_response(self, message: str, user_id: str = None) -> str:
        """
        Process the user message and return the chatbot's response.
        """
        return self.chatbot.get_response(message, user_id=user_id)