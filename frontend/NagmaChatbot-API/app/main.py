# app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from chatbot.chatbot import ChatbotService   # Absolute import
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI(
    title="Nagma Chatbot API",
    description="API for the Nagma Music Streaming Platform Chatbot",
    version="1.0.0"
)

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS configuration
origins = [
    "http://localhost:3000",  # Replace with your frontend's URL
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows all HTTP methods
    allow_headers=["*"],              # Allows all headers
)

# Initialize the chatbot service
chatbot_service = ChatbotService()

# Define the request and response models
class ChatRequest(BaseModel):
    user_id: str = Field(..., example="user123")
    message: str = Field(..., example="Can you recommend a song for me?")

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chatbot/respond", response_model=ChatResponse, tags=["Chatbot"])
async def get_chat_response(chat_request: ChatRequest):
    """
    Endpoint to get a response from the chatbot based on user message.
    """
    user_id = chat_request.user_id
    message = chat_request.message

    if not message.strip():
        logger.warning(f"Empty message received from user {user_id}.")
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        logger.info(f"Received message from user {user_id}: {message}")
        response = chatbot_service.get_response(message, user_id=user_id)
        logger.info(f"Responding to user {user_id}: {response}")
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error processing message from user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error.")

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the Nagma Chatbot API!"}