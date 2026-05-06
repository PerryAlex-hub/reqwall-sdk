import { RateLimiterOptions, SlidingWindowState } from "../types";

const windows = new Map<string, SlidingWindowState>();

export function slidingWindow(key: string, options: RateLimiterOptions): boolean {
  if (!key) throw new Error("reqwall: key is required");
  if (options.maxTokens <= 0) throw new Error("reqwall: maxTokens must be greater than 0");

  let window: SlidingWindowState = windows.get(key) ?? {
    timestamps: [],
  };
  windows.set(key, window);

  const currentTime = Date.now();
  const windowMs = options.windowMs ?? 60000;
  window.timestamps = window.timestamps.filter(
    (timestamp) => currentTime - timestamp < windowMs
  );

  if (window.timestamps.length < options.maxTokens) {
    window.timestamps.push(currentTime);
    return true;
  } else {
    return false;
  }
}