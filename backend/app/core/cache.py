"""Simple in-memory TTL cache for reducing database load.

This module provides a lightweight caching layer that stores results in memory
with automatic expiration. Useful for dashboard data that doesn't need to be
real-time but is expensive to compute.

For production with multiple workers, consider Redis instead.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any, Callable, Coroutine, TypeVar

T = TypeVar("T")


class TTLCache:
    """Thread-safe in-memory cache with TTL (time-to-live) support."""

    def __init__(self) -> None:
        self._cache: dict[str, tuple[Any, float]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Any | None:
        """Get a value from cache if it exists and hasn't expired."""
        async with self._lock:
            if key not in self._cache:
                return None
            value, expires_at = self._cache[key]
            if time.time() > expires_at:
                del self._cache[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl_seconds: int = 60) -> None:
        """Set a value in cache with TTL."""
        async with self._lock:
            expires_at = time.time() + ttl_seconds
            self._cache[key] = (value, expires_at)

    async def delete(self, key: str) -> None:
        """Delete a key from cache."""
        async with self._lock:
            self._cache.pop(key, None)

    async def clear_prefix(self, prefix: str) -> None:
        """Clear all keys starting with a prefix."""
        async with self._lock:
            keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_delete:
                del self._cache[k]

    async def clear_all(self) -> None:
        """Clear entire cache."""
        async with self._lock:
            self._cache.clear()


# Global cache instance
cache = TTLCache()


async def cached(
    key: str,
    ttl_seconds: int = 60,
    fetch_fn: Callable[[], Coroutine[Any, Any, T]] | None = None,
) -> T | None:
    """Get value from cache or fetch using provided function.
    
    Usage:
        result = await cached(
            f"dashboard:overview:{school_id}",
            ttl_seconds=30,
            fetch_fn=lambda: expensive_db_query(session, school_id)
        )
    """
    # Try cache first
    value = await cache.get(key)
    if value is not None:
        return value

    # Fetch if not cached
    if fetch_fn is not None:
        value = await fetch_fn()
        await cache.set(key, value, ttl_seconds)
        return value

    return None


def cache_key(*parts: str | int) -> str:
    """Build a cache key from parts."""
    return ":".join(str(p) for p in parts)


async def invalidate_dashboard_cache(school_id: int) -> None:
    """Invalidate all dashboard caches for a school.
    
    Call this when students, rooms, quizzes, or quiz attempts change.
    """
    await cache.clear_prefix(f"dashboard:overview:{school_id}")
    await cache.clear_prefix(f"dashboard:stats:{school_id}")


async def invalidate_school_cache(school_id: int) -> None:
    """Invalidate all caches for a school."""
    await cache.clear_prefix(f"dashboard:{school_id}")
    await cache.clear_prefix(f"students:{school_id}")
    await cache.clear_prefix(f"rooms:{school_id}")
    await cache.clear_prefix(f"quizzes:{school_id}")
