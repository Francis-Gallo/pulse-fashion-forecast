# Pulse — Architecture

## Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                  │
│         React 19 + Vite + Tailwind CSS              │
│  App.jsx · TrendCard · ControlPanel · SignalFeed    │
│              localhost:5173                         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP REST (JSON)
┌─────────────────────▼───────────────────────────────┐
│               INFRASTRUCTURE LAYER                  │
│           FastAPI + Uvicorn (Python)                │
│  /api/fetch  /api/analyze  /api/models  /api/health │
│              localhost:8000                         │
└──────┬──────────────┬────────────────┬──────────────┘
       │              │                │
┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────────────┐
│  DATA LAYER │ │ DATA LAYER │ │     DATA LAYER       │
│   Reddit    │ │  RSS Feeds │ │   Google Trends      │
│  Public API │ │ feedparser │ │     pytrends         │
│  (no key)   │ │ (no key)   │ │     (no key)         │
└─────────────┘ └────────────┘ └──────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│            FOUNDATION MODEL LAYER                   │
│                                                     │
│  Primary:  Groq Cloud — llama-3.1-8b-instant        │
│  Fallback: LM Studio — phi-3.1-mini-4k-instruct     │
│                                                     │
│  OpenAI-compatible API  ·  temperature=0.1          │
│  max_tokens=2500  ·  zero-shot JSON prompt          │
└─────────────────────────────────────────────────────┘
```

## Data & LLM Flow

```
User selects sources (Reddit subs + RSS feeds + Google Trends)
         │
         ▼
POST /api/fetch
  ├── fetch_reddit()    → up to 20 posts per subreddit (hot feed)
  ├── fetch_rss()       → up to 20 headlines per feed
  └── fetch_google_trends() → search interest scores for 5 fashion keywords
         │
         ▼  (merged list, typically 60–120 signals)
POST /api/analyze
  ├── Take top 50 signals by relevance
  ├── Format as plain text: "- [source] title (score:N)"
  ├── Send to LLM with SYSTEM_PROMPT (structured JSON template)
  └── _extract_json() — 3-layer parser (markdown strip → brace-depth walk → regex)
         │
         ▼
JSON response: { top_theme, summary, trends: [×5] }
Each trend: { name, category, confidence, momentum, goes_mainstream, why_now, action }
         │
         ▼
React renders TrendCard × 5 with confidence bars, momentum badges, timeline
```

## Business Process

```
Current workflow (manual):
  Buyer → browses Reddit/Instagram → reads trade press → forms opinion → 2-4 hours

Workflow with Pulse:
  Buyer → opens Pulse → selects sources → clicks Run → reviews 5 ranked predictions → 45 seconds
                                                              ▲
                                                       LLM intervenes here
                                                  (signal aggregation + forecasting)

Human-in-the-loop: buyer validates and acts on predictions — AI does not buy or publish
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Three.js (floating UI) |
| Backend | FastAPI 0.135, Uvicorn 0.42, Python 3.11 |
| LLM (cloud) | Llama 3.1 8B Instant — Groq Cloud API |
| LLM (local) | Phi-3.1-Mini-4K-Instruct — LM Studio |
| Data | Reddit JSON API, feedparser (RSS), pytrends (Google Trends) |
| No database | Stateless — no persistence layer |
