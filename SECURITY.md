# Pulse — Security Policy

## Secrets Management

- API keys (Groq) are entered by the user in the browser at runtime — they are **never stored on disk or committed to the repository**
- No `.env` file is used in production — the key is passed directly from frontend → backend → Groq API within a single request lifecycle
- `.env.example` contains only placeholder values
- `.gitignore` excludes `.env`, `venv/`, `node_modules/`, and `__pycache__/`

## Authentication & Authorization

- This is a single-user local PoC — no authentication system is implemented
- The FastAPI backend listens on `localhost:8000` only — not exposed to the public internet
- CORS is configured to allow all origins (`*`) — acceptable for a local development PoC; would be locked down in production

## PII Handling

- No user data is collected or stored
- Reddit posts and RSS headlines are public data — no personal information is processed
- No logs are written to disk

## Data Residency

- **Groq Cloud (primary):** inference happens on Groq's US-based servers. Data sent = up to 50 anonymized public post titles. No personal data.
- **LM Studio (fallback):** fully local — data never leaves the user's machine

## Known Limitations (PoC scope)

- No rate limiting on the backend endpoints
- No input sanitization against prompt injection (low risk: inputs are public Reddit titles)
- Not suitable for production deployment without adding authN, rate limiting, and secret management (e.g. environment variables via a secrets manager)
