# AI SDK Proxy

This project demonstrates how to use [pydantic-ai](https://ai.pydantic.dev/)'s `VercelAIAdapter` to build a Python backend that is fully compatible with the [Vercel AI SDK](https://sdk.vercel.ai/) streaming protocol — letting a React frontend built with `@ai-sdk/react` talk to a FastAPI server backed by pydantic-ai agents.

## What it demonstrates

**`VercelAIAdapter` bridges two ecosystems:** The Vercel AI SDK (TypeScript) and pydantic-ai (Python) use the same streaming wire format. `VercelAIAdapter.dispatch_request` handles translating an incoming `useChat` request into a pydantic-ai agent run and streaming the response back in the format the SDK expects.

**Multi-provider switching at runtime:** A single backend exposes two pydantic-ai agents — one backed by Anthropic (Claude Haiku) and one by OpenAI (GPT-4o mini). The frontend passes a `?provider=` query parameter and the backend routes to the correct agent. No frontend changes are needed to support a new provider; you just add an agent.

**Streaming markdown in React:** Assistant responses are streamed token-by-token and rendered incrementally using [`streamdown`](https://github.com/nicholasgasior/streamdown), which handles markdown formatting as the stream arrives.

## Architecture

```
Browser (React + @ai-sdk/react)
  │  useChat({ api: '/api/chat?provider=anthropic' })
  │
  ▼
Vite dev server  ──proxy /api──▶  FastAPI (port 8000)
                                      │
                                      │  VercelAIAdapter.dispatch_request()
                                      │
                                      ▼
                               pydantic-ai Agent
                               (anthropic | openai)
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so the frontend never needs to know the backend's address.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| AI SDK client | `@ai-sdk/react` (`useChat`), `ai` v6 |
| Markdown streaming | `streamdown` |
| Backend | FastAPI, Python 3.12+ |
| AI agent framework | `pydantic-ai` |
| LLM providers | Anthropic (`claude-haiku-4-5`), OpenAI (`gpt-4o-mini`) |

## Running locally

### Backend

```bash
cd backend
cp .env.example .env          # add your API keys
uv sync
uv run fastapi dev main.py    # starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev                      # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and use the **Anthropic / OpenAI** toggle to switch providers mid-conversation.
