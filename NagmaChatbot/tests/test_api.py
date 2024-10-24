# tests/test_api.py

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Nagma Chatbot API!"}

def test_chatbot_response():
    response = client.post(
        "/api/chatbot/respond",
        json={"user_id": "user123", "message": "Can you recommend a song for me?"}
    )
    assert response.status_code == 200
    assert "response" in response.json()