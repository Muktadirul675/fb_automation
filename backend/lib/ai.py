import os
import httpx
from ..config import settings

# Create a reusable HTTP client instance
ai = httpx.AsyncClient(
    base_url="https://ai.worthmind.net",
    headers={
        "Content-Type": "application/json",
        'accept': 'application/json',
        "Ocp-Apim-Subscription-Key" : settings.lite_llm_api_key
    },
    timeout=10.0
)