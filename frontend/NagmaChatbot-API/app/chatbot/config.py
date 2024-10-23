# app/chatbot/config.py

import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file

DATA_PATH = os.getenv("DATA_PATH", "app/chatbot/data.csv")  # Default path if not set