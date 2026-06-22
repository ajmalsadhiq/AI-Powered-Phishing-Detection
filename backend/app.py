from __future__ import annotations

import hashlib
import os
import re
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from cache import PredictionCache
from explainer import PhishingExplainer
from model import PhishingModel
from url_analyzer import URLAnalyzer

app = FastAPI(
    title="AJMAL's-PHISHING-GUARD API",
    version="1.0.0",
    description="AI-powered phishing detection API with text and URL analysis.",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = PredictionCache.from_env()
model = PhishingModel()
explainer = PhishingExplainer(model=model)
url_analyzer = URLAnalyzer()
URL_PATTERN = re.compile(r"https?://[^\s<>'\"]+|www\.[^\s<>'\"]+", re.IGNORECASE)


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20_000)


class URLRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=4_096)


def extract_links(text: str) -> list[str]:
    links: list[str] = []
    for match in URL_PATTERN.findall(text):
        cleaned = match.rstrip(".,);]\"'")
        if cleaned.startswith("www."):
            cleaned = f"https://{cleaned}"
        if cleaned not in links:
            links.append(cleaned)
    return links


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model": model.name,
        "cache": cache.backend_name,
    }


@app.post("/predict")
def predict(payload: PredictRequest) -> dict[str, Any]:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    cache_key = hashlib.sha256(text.encode("utf-8")).hexdigest()
    cached = cache.get(cache_key)
    if cached:
        return cached

    result = model.predict(text)
    explanation = explainer.explain(text, top_k=6)
    suspicious_phrases = explainer.highlight_suspicious_phrases(text)
    links = extract_links(text)
    suspicious_links = []
    for link in links:
        link_analysis = url_analyzer.analyze(link, email_text=text)
        suspicious_links.append(
            {
                "url": link,
                "overall_risk": link_analysis["overall_risk"],
                "has_https": link_analysis["has_https"],
                "suspicious_keywords": link_analysis["suspicious_keywords"],
                "domain_age_risk": link_analysis["domain_age_risk"],
                "ssl_status": link_analysis["ssl_status"],
                "domain_mismatch": link_analysis["domain_mismatch"],
                "flagged": link_analysis["overall_risk"] >= 0.5,
            }
        )

    response = {
        "prediction": result.label,
        "confidence": result.confidence,
        "risk_score": result.risk_score,
        "signals": result.signals,
        "explanation": explanation,
        "suspicious_phrases": suspicious_phrases,
        "suspicious_links": suspicious_links,
    }
    cache.set(cache_key, response)
    return response


@app.post("/analyze-url")
def analyze_url(payload: URLRequest) -> dict[str, Any]:
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
    return url_analyzer.analyze(url)


@app.post("/explain")
def explain(payload: PredictRequest) -> dict[str, Any]:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    return {
        "highlights": explainer.highlight_suspicious_phrases(text),
        "summary": explainer.explain(text, top_k=10),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
