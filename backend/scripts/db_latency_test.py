import asyncio
import os
import time
from typing import Optional
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

import dotenv
dotenv.load_dotenv()
import psycopg


def _normalize_db_url(database_url: str) -> str:
    """Parse and rebuild URL for psycopg compatibility."""
    # Remove SQLAlchemy driver spec
    url = database_url.replace("postgresql+psycopg://", "postgresql://", 1)
    
    # Parse URL
    parsed = urlparse(url)
    
    # Only keep standard connection parameters
    # psycopg doesn't like the "options" parameter as-is, so skip it
    params = {}
    if parsed.query:
        qs = parse_qs(parsed.query, keep_blank_values=True)
        # Extract only sslmode (other standard params)
        if "sslmode" in qs:
            params["sslmode"] = qs["sslmode"][0]
    
    # Rebuild query string
    query_str = urlencode(params) if params else ""
    
    # Rebuild URL
    netloc = parsed.netloc
    path = parsed.path
    new_url = f"postgresql://{netloc}{path}"
    if query_str:
        new_url += f"?{query_str}"
    
    return new_url


async def measure_once(url: str) -> tuple[float, float]:
    """Return (connect_ms, query_ms)."""
    t0 = time.perf_counter()
    async with await psycopg.AsyncConnection.connect(url, connect_timeout=10) as conn:
        t1 = time.perf_counter()
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1;")
            await cur.fetchone()
        t2 = time.perf_counter()
    connect_ms = (t1 - t0) * 1000
    query_ms = (t2 - t1) * 1000
    return connect_ms, query_ms


async def main(iterations: int = 5) -> None:
    raw_url: Optional[str] = os.environ.get("DATABASE_URL")
    if not raw_url:
        raise SystemExit("DATABASE_URL is required in the environment")

    url = _normalize_db_url(raw_url)
    print(f"Testing DB at: {url[:80]}...")
    results = []
    for i in range(iterations):
        try:
            connect_ms, query_ms = await measure_once(url)
            results.append((connect_ms, query_ms))
            print(f"[{i+1}] connect_ms={connect_ms:.1f} query_ms={query_ms:.1f}")
        except Exception as e:
            print(f"[{i+1}] Error: {e}")
            continue

    if results:
        avg_connect = sum(c for c, _ in results) / len(results)
        avg_query = sum(q for _, q in results) / len(results)
        print(f"\nAverage over {len(results)} successful runs:")
        print(f"  connect_ms={avg_connect:.1f}")
        print(f"  query_ms={avg_query:.1f}")
        print(f"  total_round_trip_ms={avg_connect + avg_query:.1f}")


if __name__ == "__main__":
    asyncio.run(main())
