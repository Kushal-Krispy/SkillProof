import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import HTTPException, Request, status
from app.core.config import settings


class InMemoryRateLimiter:
    """
    Sliding window in-memory rate limiter.
    Tracks timestamps of attempts per key (e.g. client IP or IP + email).
    """

    def __init__(self):
        # Key -> List of unix timestamps (floats)
        self._records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(
        self,
        key: str,
        max_attempts: int,
        window_seconds: int,
    ) -> Tuple[bool, int]:
        """
        Check if an attempt is allowed.
        Returns:
            (is_allowed: bool, retry_after_seconds: int)
        """
        now = time.time()
        window_start = now - window_seconds

        # Clean up timestamps older than the sliding window
        self._records[key] = [ts for ts in self._records[key] if ts > window_start]

        if len(self._records[key]) >= max_attempts:
            oldest_in_window = self._records[key][0]
            retry_after = int(window_seconds - (now - oldest_in_window)) + 1
            return False, max(retry_after, 1)

        # Record this attempt
        self._records[key].append(now)
        return True, 0

    def reset(self, key: str = None):
        """Reset rate limiter state (useful for test isolation)."""
        if key:
            self._records.pop(key, None)
        else:
            self._records.clear()


# Global login rate limiter instance
login_rate_limiter = InMemoryRateLimiter()


def check_login_rate_limit(request: Request, identifier: str = ""):
    """
    FastAPI dependency / helper enforcing rate limits on login attempts.
    Combines client IP and optional identifier (like email) to prevent distributed brute force.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    rate_limit_key = f"login:{client_ip}:{identifier.lower().strip()}"

    allowed, retry_after = login_rate_limiter.is_allowed(
        key=rate_limit_key,
        max_attempts=settings.RATE_LIMIT_LOGIN_MAX_ATTEMPTS,
        window_seconds=settings.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Please wait {retry_after} seconds before trying again.",
            headers={"Retry-After": str(retry_after)},
        )
