from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    facebook_client_id: str
    facebook_client_secret: str
    secret_key : str
    lite_llm_api_key : str

    class Config:
        env_file = ".env" 

settings = Settings()