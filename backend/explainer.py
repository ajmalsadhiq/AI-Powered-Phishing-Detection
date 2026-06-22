import re
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
        self.candidate_phrases = [
            "verify your identity",
            "permanent account closure",
            "account closure",
            "urgent",
            "verify now",
            "verify",
            "password",
            "click here",
            "click the link",
            "clicking the link",
            "immediately",
            "24 hours",
            "valued customer",
            "dear customer",
            "account",
            "login",
            "confirm",
            "wire transfer",
            "gift card",
            "reset your",
            "suspended",
            "restricted",
        ]

    def explain(self, text: str, top_k: int = 5) -> list[dict[str, float | str]]:
        lowered = text.lower()
        matched_phrases = []
        temp_text = lowered
        # Match candidate phrases greedy (longest first) and mask to prevent overlapping duplicates
        for phrase in sorted(self.candidate_phrases, key=len, reverse=True):
            if phrase in temp_text:
                matched_phrases.append(phrase)
                temp_text = temp_text.replace(phrase, " [MASK] ")

        if not matched_phrases:
            return [{"phrase": "No strong phishing indicators found", "score": 0.08}]

        # Calculate original risk score
        orig_res = self.model.predict(text)
        orig_score = orig_res.risk_score

        explanations = []
        for phrase in matched_phrases:
            # Mask the phrase to calculate its contribution (Leave-One-Out / Occlusion)
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            perturbed_text = pattern.sub(" ", text)

            pert_res = self.model.predict(perturbed_text)
            importance = orig_score - pert_res.risk_score
            importance = round(max(0.01, importance), 4)
            explanations.append({"phrase": phrase, "score": importance})

        # Sort by importance descending
        explanations.sort(key=lambda x: x["score"], reverse=True)
        return explanations[:top_k]

    def highlight_suspicious_phrases(self, text: str) -> list[dict[str, float | str]]:
        expls = self.explain(text, top_k=10)
        highlights = []
        for e in expls:
            if e["phrase"] == "No strong phishing indicators found":
                continue
            highlights.append({"phrase": e["phrase"], "severity": e["score"]})
        return highlights

