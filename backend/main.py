from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import feedparser
import json
import re
from openai import OpenAI
from typing import List
try:
    from pytrends.request import TrendReq
    PYTRENDS_AVAILABLE = True
except ImportError:
    PYTRENDS_AVAILABLE = False

app = FastAPI(title="Pulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HEADERS = {"User-Agent": "Pulse/1.0 (academic research)"}

# ── Reddit ─────────────────────────────────────────────────────────────────────
def fetch_reddit(subreddits: list[str], limit: int = 20) -> list[dict]:
    signals = []
    for sub in subreddits:
        try:
            r = requests.get(
                f"https://www.reddit.com/r/{sub}/hot.json?limit={limit}",
                headers=HEADERS, timeout=8
            )
            if r.status_code != 200:
                continue
            for p in r.json()["data"]["children"]:
                d = p["data"]
                if d.get("stickied"):
                    continue
                signals.append({
                    "source": f"r/{sub}",
                    "title": d["title"],
                    "score": d["score"],
                    "comments": d["num_comments"],
                    "upvote_ratio": d.get("upvote_ratio", 0),
                })
        except Exception:
            continue
    return signals


# ── RSS Feeds ──────────────────────────────────────────────────────────────────
RSS_SOURCES = {
    "Hypebeast":            "https://hypebeast.com/feed",
    "The Cut":              "https://www.thecut.com/rss.xml",
    "Business of Fashion":  "https://www.businessoffashion.com/rss",
    "Vogue":                "https://www.vogue.com/feed/rss",
    "WWD":                  "https://wwd.com/feed/",
    "Refinery29":           "https://www.refinery29.com/en-us/rss.xml",
}


def fetch_rss(feed_names: list[str], limit: int = 20) -> list[dict]:
    signals = []
    for name in feed_names:
        url = RSS_SOURCES.get(name)
        if not url:
            continue
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:limit]:
                title = entry.get("title", "").strip()
                if title:
                    signals.append({
                        "source": name,
                        "title": title,
                        "score": 0,
                        "comments": 0,
                        "upvote_ratio": 1.0,
                    })
        except Exception:
            continue
    return signals


# ── Google Trends ──────────────────────────────────────────────────────────────
FASHION_KEYWORDS = [
    "streetwear", "vintage fashion", "sustainable fashion",
    "quiet luxury", "gorpcore", "balletcore"
]

def fetch_google_trends() -> list[dict]:
    if not PYTRENDS_AVAILABLE:
        return []
    signals = []
    try:
        pt = TrendReq(hl="en-US", tz=0, timeout=(10, 25))
        pt.build_payload(FASHION_KEYWORDS[:5], timeframe="now 7-d", geo="")
        df = pt.interest_over_time()
        if df.empty:
            return []
        latest = df.iloc[-1]
        for kw in FASHION_KEYWORDS[:5]:
            score = int(latest.get(kw, 0))
            if score > 10:
                signals.append({
                    "source": "Google Trends",
                    "title": f"{kw} — search interest score {score}/100",
                    "score": score,
                    "comments": 0,
                    "upvote_ratio": round(score / 100, 2),
                })
    except Exception:
        pass
    return signals


# ── Manual ─────────────────────────────────────────────────────────────────────
def parse_manual(text: str) -> list[dict]:
    return [
        {"source": "Manual", "title": line.strip(), "score": 0, "comments": 0, "upvote_ratio": 1.0}
        for line in text.strip().splitlines() if line.strip()
    ]


# ── LLM ────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a fashion trend forecaster. Analyze signals and predict 5 trends going mainstream in 3-6 months.

Output ONLY this JSON, no other text:
{"market_sentiment":"Emerging","top_theme":"string","summary":"string","trends":[{"name":"string","category":"string","confidence":80,"summary":"string","action":"string","momentum":"rising","goes_mainstream":"2-3 months","why_now":"string"},{"name":"string","category":"string","confidence":75,"summary":"string","action":"string","momentum":"emerging","goes_mainstream":"3-4 months","why_now":"string"},{"name":"string","category":"string","confidence":70,"summary":"string","action":"string","momentum":"rising","goes_mainstream":"next season","why_now":"string"},{"name":"string","category":"string","confidence":65,"summary":"string","action":"string","momentum":"emerging","goes_mainstream":"4-6 months","why_now":"string"},{"name":"string","category":"string","confidence":60,"summary":"string","action":"string","momentum":"peaking","goes_mainstream":"6 weeks","why_now":"string"}]}

Rules:
- Fashion only: clothing, accessories, aesthetics, materials, silhouettes
- Be specific: not "sustainable fashion" but "deadstock denim patchwork jackets"
- momentum: rising, emerging, or peaking only
- Replace every "string" with real content based on the signals
- Output valid JSON only, nothing else"""


def _extract_json(text: str) -> dict:
    text = text.strip()
    # strip markdown fences
    for fence in ["```json", "```"]:
        if fence in text:
            parts = text.split(fence)
            for part in parts:
                cleaned = part.split("```")[0].strip()
                if cleaned.startswith("{"):
                    text = cleaned
                    break
    # find outermost JSON object
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found")
    # walk to find matching closing brace
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return json.loads(text[start:i+1])
    # fallback: try regex
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError("Could not extract JSON")


# ── API Models ─────────────────────────────────────────────────────────────────
class FetchRequest(BaseModel):
    reddit_subs: List[str] = []
    reddit_limit: int = 20
    rss_feeds: List[str] = []
    manual_text: str = ""
    use_gtrends: bool = False


class AnalyzeRequest(BaseModel):
    signals: List[dict]
    lm_url: str = "http://localhost:1234/v1"
    model: str = "local-model"
    groq_api_key: str = ""


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/models")
def get_models(lm_url: str = "http://localhost:1234/v1"):
    try:
        base = lm_url.rstrip("/")
        if base.endswith("/v1"):
            base = base[:-3]
        r = requests.get(f"{base}/v1/models", timeout=4)
        return {"models": [m["id"] for m in r.json().get("data", [])]}
    except Exception:
        return {"models": []}


@app.get("/api/sources")
def get_sources():
    return {"rss_feeds": list(RSS_SOURCES.keys())}


@app.post("/api/fetch")
def fetch_signals(req: FetchRequest):
    all_signals = []
    stats = {}

    if req.reddit_subs:
        r = fetch_reddit(req.reddit_subs, req.reddit_limit)
        all_signals.extend(r)
        stats["reddit"] = len(r)

    if req.rss_feeds:
        f = fetch_rss(req.rss_feeds)
        all_signals.extend(f)
        stats["rss"] = len(f)

    if req.manual_text:
        m = parse_manual(req.manual_text)
        all_signals.extend(m)
        stats["manual"] = len(m)

    if req.use_gtrends:
        g = fetch_google_trends()
        all_signals.extend(g)
        stats["gtrends"] = len(g)

    return {"signals": all_signals, "total": len(all_signals), "stats": stats}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    if not req.signals:
        raise HTTPException(400, "No signals provided")

    signal_text = "\n".join(
        f"- [{s['source']}] {s['title']}" + (f" (score:{s['score']})" if s.get("score") else "")
        for s in req.signals[:50]
    )

    if req.groq_api_key:
        client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=req.groq_api_key)
        model = "llama-3.1-8b-instant"
    else:
        client = OpenAI(base_url=req.lm_url, api_key="lm-studio")
        model = req.model

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Signals:\n{signal_text}\n\nJSON:"},
            ],
            temperature=0.1,
            max_tokens=2500,
        )
        raw = resp.choices[0].message.content
        if not raw or not raw.strip():
            raise HTTPException(500, "Model returned empty response — check LM Studio has a model loaded")
        return _extract_json(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(500, f"Invalid JSON: {e}")
    except ValueError as e:
        raise HTTPException(500, f"Parse error: {e}")
    except Exception as e:
        raise HTTPException(500, str(e))
