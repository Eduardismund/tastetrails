import hashlib
import json
import os
from typing import Optional

import redis.asyncio as redis

redis_client: redis.Redis | None = None

async def get_redis() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.Redis(
            host=os.environ.get("REDIS_HOST"),
            port=int(os.environ.get("REDIS_PORT")),
            password=os.environ.get("REDIS_PASS"),
            decode_responses=True,
        )
    return redis_client


class RedisCache:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    async def get_cache(self, key: str) -> Optional[dict]:
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)
        return None

    async def set_cache(self, key: str, value: dict, ttl_seconds: int = 1800) -> None:
        await self.redis.set(key, json.dumps(value), ex=ttl_seconds)

    @staticmethod
    def generate_cache_key(prefix: str, data) -> str:
        data_string = json.dumps(data, sort_keys=True)
        data_hash = hashlib.sha256(data_string.encode('utf-8')).hexdigest()
        return f"{prefix}:{data_hash}"


# Singleton instance of RedisCache
redis_cache: RedisCache | None = None

async def get_redis_cache() -> RedisCache:
    global redis_cache
    if redis_cache is None:
        redis = await get_redis()
        redis_cache = RedisCache(redis)
    return redis_cache


__all__ = ['RedisCache', 'redis_cache', 'get_redis_cache']
