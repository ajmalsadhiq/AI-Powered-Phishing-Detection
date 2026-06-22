from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass

try:
    import redis
except Exception:  # pragma: no cover - optional dependency fallback
    redis = None


@dataclass
class _CacheItem:
    value: str
    expires_at: float


class PredictionCache:
    def __init__(self, client=None, ttl_seconds: int = 300) -> None:
        self._client = client
        self._ttl_seconds = ttl_seconds
        self._memory: dict[str, _CacheItem] = {}
        self.backend_name = "redis" if client is not None else "memory"

    @classmethod
    def from_env(cls) -> "PredictionCache":
        redis_url = os.getenv("REDIS_URL")
        ttl_seconds = int(os.getenv("CACHE_TTL_SECONDS", "300"))
        if redis is not None and redis_url:
            try:
                client = redis.from_url(redis_url, decode_responses=True)
                client.ping()
                return cls(client=client, ttl_seconds=ttl_seconds)
            except Exception:
                pass
        return cls(ttl_seconds=ttl_seconds)

    def get(self, key: str):
        if self._client is not None:
            raw = self._client.get(key)
            return json.loads(raw) if raw else None

        item = self._memory.get(key)
        if item is None:
            return None
        if item.expires_at < time.time():
            self._memory.pop(key, None)
            return None
        return json.loads(item.value)

    def set(self, key: str, value) -> None:
        payload = json.dumps(value)
        if self._client is not None:
            self._client.setex(key, self._ttl_seconds, payload)
            return
        self._memory[key] = _CacheItem(value=payload, expires_at=time.time() + self._ttl_seconds)
