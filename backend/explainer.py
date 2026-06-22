from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

try:
    import torch
except Exception:  # pragma: no cover - optional dependency fallback
    torch = None


@dataclass
class Explanation:
    phrase: str
    score: float


class PhishingExplainer:
    def __init__(self, model, tokenizer: Callable | None = None) -> None:
        self.model = model
        self.tokenizer = tokenizer
        self.suspicious_phrases = [
            "verify your account",
            "urgent action required",
            "click here to confirm",
            "reset your password",
            "login immediately",
            "account suspended",
            "wire transfer",
            "confirm your details",
            "security alert",
        ]

    def explain(self, text: str, top_k: int = 5) -> list[dict[str, float | str]]:
        lowered = text.lower()
        matches: list[Explanation] = []
        for phrase in self.suspicious_phrases:
            if phrase in lowered:
                matches.append(Explanation(phrase=phrase, score=0.92))
        if not matches:
            return [{"phrase": "No strong phishing indicators found", "score": 0.08}]
        return [{"phrase": item.phrase, "score": item.score} for item in matches[:top_k]]

    def highlight_suspicious_phrases(self, text: str) -> list[dict[str, float | str]]:
        lowered = text.lower()
        highlights: list[dict[str, float | str]] = []
        for phrase in self.suspicious_phrases:
            if phrase in lowered:
                highlights.append({"phrase": phrase, "severity": 0.9})
        return highlights
