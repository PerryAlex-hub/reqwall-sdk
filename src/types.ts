export interface RateLimiterOptions {
  algorithm: "token-bucket" | "sliding-window";
  maxTokens: number;
  windowMs?: number;
  refillRate?: number;
}

export interface TokenBucketState {
  tokens: number;
  lastRefillTime: number;
}

export interface SlidingWindowState {
    timestamps: number[];
}