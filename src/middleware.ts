import { Request, Response, NextFunction } from "express";
import { RateLimiterOptions } from "./types";
import { tokenBucket } from "./algorithms/tokenBucket";
import { slidingWindow } from "./algorithms/slidingWindow";

export function reqwall(options: RateLimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip ?? req.socket.remoteAddress ?? "unknown";

      const allowed =
        options.algorithm === "token-bucket"
          ? tokenBucket(key, options)
          : slidingWindow(key, options);

      if (allowed) {
        next();
      } else {
        res.status(429).json({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: options.windowMs ?? 60000,
        });
      }
    } catch (err) {
      next(err);
    }
  };
}
