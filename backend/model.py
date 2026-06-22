from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import torch
    from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
except Exception:  # pragma: no cover - optional dependency fallback
    torch = None
    DistilBertForSequenceClassification = None
    DistilBertTokenizerFast = None


@dataclass
class PredictionResult:
    label: str
    confidence: float
    risk_score: float
    signals: dict[str, Any]


class PhishingModel:
    def __init__(self, model_path: str | None = None) -> None:
        self.model_path = Path(model_path or Path(__file__).resolve().parent / "phishing_model")
        self.name = "distilbert-fallback"
        self._model = None
        self._tokenizer = None
        self._device = "cpu"

        if torch is not None and DistilBertForSequenceClassification is not None and DistilBertTokenizerFast is not None:
            self._load_if_available()

    def _load_if_available(self) -> None:
        if not self.model_path.exists():
            return
        try:
            self._tokenizer = DistilBertTokenizerFast.from_pretrained(self.model_path)
            self._model = DistilBertForSequenceClassification.from_pretrained(self.model_path)
            self._model.eval()
            self.name = "distilbert"
        except Exception:
            self._model = None
            self._tokenizer = None

    def predict(self, text: str) -> PredictionResult:
        if self._model is None or self._tokenizer is None or torch is None:
            return self._heuristic_predict(text)

        inputs = self._tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = self._model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)[0]
            label_index = int(torch.argmax(probabilities).item())
            confidence = float(probabilities[label_index].item())

        label = "phishing" if label_index == 1 else "legitimate"
        risk_score = confidence if label == "phishing" else 1 - confidence
        return PredictionResult(label=label, confidence=confidence, risk_score=risk_score, signals={"source": self.name})

    def _heuristic_predict(self, text: str) -> PredictionResult:
        lowered = text.lower()
        suspicious_terms = {
            "urgent": 0.08,
            "verify": 0.15,
            "password": 0.12,
            "account": 0.08,
            "login": 0.12,
            "click here": 0.18,
            "immediately": 0.08,
            "confirm": 0.1,
            "wire transfer": 0.2,
            "gift card": 0.15,
            "reset your": 0.12,
        }
        score = 0.12
        matched = []
        for term, weight in suspicious_terms.items():
            if term in lowered:
                score += weight
                matched.append(term)
        if any(token in lowered for token in ["http://", "https://", "www."]):
            score += 0.08
            matched.append("url_present")
        if text.count("!") >= 3:
            score += 0.05
            matched.append("excessive_punctuation")
        if len(text) > 800:
            score += 0.03
        score = max(0.01, min(score, 0.99))
        label = "phishing" if score >= 0.5 else "legitimate"
        confidence = score if label == "phishing" else 1 - score
        return PredictionResult(
            label=label,
            confidence=round(confidence, 4),
            risk_score=round(score, 4),
            signals={"source": "heuristic", "matched_terms": matched},
        )
