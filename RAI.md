# Pulse — Responsible & Frugal AI

## Model Selection

| Criterion | Choice | Reason |
|---|---|---|
| Model | Llama 3.1 8B Instant | Smallest model that reliably follows structured JSON instructions |
| Provider | Groq Cloud | Free tier, no GPU required, ~3s response time |
| Fallback | Phi-3.1-Mini-4K (local) | Zero-cost, fully offline, no data leaves the machine |
| Temperature | 0.1 | Near-deterministic — trend forecasts should be consistent, not creative |
| Max tokens | 2500 | Sufficient for 5-trend JSON; prevents runaway generation and cost overrun |

**Smallest-sufficient model principle:** 8B parameters instead of 70B. The task (structured JSON extraction from signals) does not require advanced reasoning — smaller, faster model is the right choice.

## Guardrails Implemented

### Input constraints
- Signals capped at **50 items** sent to the LLM — prevents context overflow and controls cost
- Only **public Reddit posts and RSS headlines** used — no private or sensitive data
- Domain filter in prompt: *"Fashion only — clothing, accessories, aesthetics, materials, silhouettes"*

### Output constraints
- Structured JSON template in system prompt — model fills slots, cannot deviate into free-form generation
- `momentum` field constrained to enum: `rising | emerging | peaking`
- `confidence` is a number 0–100 — not a qualitative label the model can hallucinate
- 3-layer JSON parser — malformed output is caught and surfaced as an error, not silently accepted

### Prompt injection defense
- Signals are plain text strings — not executed as code
- System prompt is server-side only — not user-modifiable via the UI

## Cost Controls

- Groq free tier: **$0 cost**
- LM Studio fallback: **$0 cost**, runs fully offline
- Input capped at 50 short strings (~1500 tokens) — predictable cost per run
- No vector database, no embeddings, no fine-tuning

## Known Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hallucination | Predictions grounded in real signal titles; confidence % shows uncertainty |
| Bias | Reddit skews young/Western — may not reflect global fashion markets |
| Data freshness | Reddit hot feed updates every few hours — signals are always current |
| Privacy | Only public posts used; no usernames or PII extracted |

## What the App Refuses to Do

- Does not forecast non-fashion topics (prompt enforces domain restriction)
- Does not store user API keys
- Does not make purchasing decisions — human validation always required
