import asyncio
import httpx
from lib.ai import ai

async def main():
    response = await ai.post(
        "/chat/completions",
        json={
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "What is the name of bangladesh capital?"}]
        }
    )
    print(response.json())
    
    res = await ai.get("/models")
    print(res.json())
        
if __name__ == "__main__":
    asyncio.run(main())

