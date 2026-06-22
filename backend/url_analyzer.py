from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urlparse

try:
    import whois
except Exception:  # pragma: no cover - optional dependency fallback
    whois = None


@dataclass
class URLAnalysis:
    url: str
    has_https: bool
    url_length: int
    suspicious_keywords: list[str]
    domain_age_days: int | None
    domain_age_risk: bool
    url_length_risk: bool
    overall_risk: float


class URLAnalyzer:
    suspicious_keywords = ["login", "verify", "secure", "update", "confirm", "banking", "password"]

    def analyze(self, url: str) -> dict[str, object]:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        lowered = url.lower()
        keywords = [keyword for keyword in self.suspicious_keywords if keyword in lowered]
        domain_age_days, domain_age_risk = self._domain_age(host)
        has_https = url.startswith("https://")
        url_length = len(url)
        url_length_risk = url_length > 100
        overall_risk = 0.18
        if keywords:
            overall_risk += min(0.3, 0.08 * len(keywords))
        if domain_age_risk:
            overall_risk += 0.25
        if not has_https:
            overall_risk += 0.15
        if url_length_risk:
            overall_risk += 0.12
        return {
            "url": url,
            "has_https": has_https,
            "url_length": url_length,
            "suspicious_keywords": keywords,
            "domain_age_days": domain_age_days,
            "domain_age_risk": domain_age_risk,
            "url_length_risk": url_length_risk,
            "overall_risk": round(min(overall_risk, 0.99), 4),
        }

    def _domain_age(self, host: str) -> tuple[int | None, bool]:
        if not host or whois is None:
            return None, True
        try:
            record = whois.whois(host)
            creation_date = record.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            if creation_date is None:
                return None, True
            age_days = (datetime.utcnow() - creation_date).days
            return age_days, age_days < 365
        except Exception:
            return None, True
