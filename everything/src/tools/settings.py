"""
Settings module for Postizz API tools
"""
import os
from typing import Optional

# API Configuration
API_BASE_URL = "https://postiz.oculair.ca/api"
API_TOKEN = "255364482e25a51ff9a6660135b8c88995e7ae68615fb9a67ad14d601f8fe0ff"

def get_headers() -> dict:
    """Get headers for API requests including auth token"""
    return {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }