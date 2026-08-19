from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

    GEMINI_API_KEY: str = "your_default_key_here"

    GEMINI_AGENT_MODEL: str = "gemini-flash-latest"
    GEMINI_JUDGE_MODEL: str = "gemini-flash-latest"

    # OpenRouter (OpenAI-compatible) — default LLM provider for the demo Agent
    # and the Fact Judge. See app/agent/openrouter.py and app/judge/openrouter.py.
    OPENROUTER_API_KEY: str = "your_default_key_here"
    OPENROUTER_MODEL: str = "openai/gpt-oss-20b:free"

    # Selects which provider app/detection/service.py wires in: "openrouter"
    # (default, unchanged behavior), "grok", or "groq". See app/agent/grok.py,
    # app/judge/grok.py, app/agent/groq.py, app/judge/groq.py.
    LLM_PROVIDER: str = "openrouter"

    # xAI Grok (OpenAI-compatible) — alternate provider, only used when
    # LLM_PROVIDER=grok. XAI_MODEL default below is PROVISIONAL: xAI's
    # /v1/models endpoint requires auth, so it could not be verified without
    # a key — confirm it against a live /v1/models call before relying on it.
    XAI_API_KEY: str = "your_default_key_here"
    XAI_MODEL: str = "grok-4"

    # Groq (api.groq.com, OpenAI-compatible) — alternate provider, only used
    # when LLM_PROVIDER=groq. Not the same service as xAI — Groq is a fast
    # inference host for open-weight models. Verified live against
    # GET https://api.groq.com/openai/v1/models with the configured key.
    GROQ_API_KEY: str = "your_default_key_here"
    GROQ_MODEL: str = "qwen/qwen3.6-27b"

    SEMANTIC_MODEL: str = "all-MiniLM-L6-v2"
    
    SEMANTIC_BLOCK_THRESHOLD: float = 0.85
    FACT_CONFIDENCE_THRESHOLD: float = 0.75
    REVIEW_THRESHOLD: float = 0.6

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # AWS Configuration
    AWS_REGION: str = "us-east-1"
    DYNAMODB_TABLE: str = "semantic-guard-audit"

settings = Settings()
