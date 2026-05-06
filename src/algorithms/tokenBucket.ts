import { RateLimiterOptions, TokenBucketState } from "../types";

const buckets = new Map<string, TokenBucketState>();

export function tokenBucket(key: string, options: RateLimiterOptions): boolean {
  if (!key) throw new Error("reqwall: key is required");
  if (options.maxTokens <= 0)
    throw new Error("reqwall: maxTokens must be greater than 0");

  let bucket: TokenBucketState = buckets.get(key) ?? {
    tokens: options.maxTokens,
    lastRefillTime: Date.now(),
  };
  buckets.set(key, bucket);

  const currentTime = Date.now();
  const timeElapsed = currentTime - bucket.lastRefillTime;
  const refillRate = options.refillRate ?? 10;
  const windowMs = options.windowMs ?? 60000;
  const tokensToAdd = (timeElapsed / windowMs) * refillRate;
  bucket.tokens = Math.min(bucket.tokens + tokensToAdd, options.maxTokens);
  bucket.lastRefillTime = currentTime;

  if (bucket.tokens < 1) {
    return false;
  } else {
    bucket.tokens -= 1;
    return true;
  }
}
