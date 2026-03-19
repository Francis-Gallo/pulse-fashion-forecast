# Changelog

## [v1.0.0] — 2026-03-19

### Added
- React 19 + Vite + Tailwind CSS frontend (Pulse)
- FastAPI backend with 4 endpoints: `/api/health`, `/api/fetch`, `/api/analyze`, `/api/models`
- Reddit public API integration — fetch hot posts from fashion subreddits
- RSS feed integration — Hypebeast, The Cut, Business of Fashion, Vogue, WWD, Refinery29
- Google Trends integration via pytrends — live fashion keyword search interest
- Groq Cloud support — Llama 3.1 8B Instant via OpenAI-compatible API
- LM Studio fallback — local model support (Phi-3.1-Mini-4K-Instruct)
- Fashion trend forecasting prompt — 5 ranked predictions with confidence, momentum, timeline
- TrendCard component — expandable cards with confidence bars and action items
- SignalFeed component — raw signal browser with source filtering
- History tab — tracks past forecast runs in session
- Export to .txt — download forecast results
- Floating clothing item hero (CSS animations)
- Playfair Display + Inter + JetBrains Mono typography
