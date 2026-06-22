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
        self.candidate_phrases = {
            "verify your identity": 0.18,
            "permanent account closure": 0.15,
            "account closure": 0.14,
            "urgent": 0.12,
            "verify now": 0.12,
            "verify": 0.15,
            "password": 0.12,
            "click here": 0.18,
            "click the link": 0.09,
            "clicking the link": 0.09,
            "immediately": 0.08,
            "24 hours": 0.10,
            "valued customer": 0.06,
            "dear customer": 0.05,
            "account": 0.08,
            "login": 0.12,
            "confirm": 0.10,
            "wire transfer": 0.20,
            "gift card": 0.15,
            "reset your": 0.12,
            "suspended": 0.12,
            "restricted": 0.10,
        }

    def explain(self, text: str, top_k: int = 5) -> list[dict[str, float | str]]:
        lowered = text.lower()
        matched_phrases = []
        temp_text = lowered
        # Match candidate phrases greedy (longest first) and mask to prevent overlapping duplicates
        for phrase in sorted(self.candidate_phrases.keys(), key=len, reverse=True):
            if phrase in temp_text:
                matched_phrases.append(phrase)
                temp_text = temp_text.replace(phrase, " [MASK] ")

        if not matched_phrases:
            return [{"phrase": "No strong phishing indicators found", "score": 0.08}]

        # Calculate original risk score
        orig_res = self.model.predict(text)
        orig_score = orig_res.risk_score
        is_heuristic = orig_res.signals.get("source") == "heuristic"

        explanations = []
        for phrase in matched_phrases:
            if is_heuristic:
                # Direct weight lookup for heuristic predictions
                importance = self.candidate_phrases.get(phrase, 0.05)
            else:
                # Mask the phrase to calculate its contribution (Leave-One-Out / Occlusion)
                pattern = re.compile(re.escape(phrase), re.IGNORECASE)
                perturbed_text = pattern.sub(" ", text)

                pert_res = self.model.predict(perturbed_text)
                importance = orig_score - pert_res.risk_score
                importance = round(max(0.01, importance), 4)

                # Fallback to base weight if occlusion score change is saturated/negligible
                if importance <= 0.01:
                    importance = self.candidate_phrases.get(phrase, 0.05)

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

