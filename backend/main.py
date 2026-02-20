from dotenv import load_dotenv; load_dotenv()  # must run before pydantic-ai reads env

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response
from pydantic_ai import Agent
from pydantic_ai.ui.vercel_ai import VercelAIAdapter

_SYSTEM = "You are a helpful assistant. Respond in clear, concise markdown."

agents: dict[str, Agent] = {
    "anthropic": Agent("anthropic:claude-haiku-4-5-20251001", system_prompt=_SYSTEM),
    "openai":    Agent("openai:gpt-4o-mini",                system_prompt=_SYSTEM),
}

app = FastAPI(title="AI SDK Proxy")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(
    request: Request,
    provider: str = Query("anthropic", pattern="^(anthropic|openai)$"),
) -> Response:
    agent = agents[provider]
    return await VercelAIAdapter.dispatch_request(request, agent=agent, sdk_version=6)
