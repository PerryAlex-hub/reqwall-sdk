# reqwall

A lightweight, developer-friendly rate limiting middleware for Express.js with support for **Token Bucket** and **Sliding Window** algorithms.

---

## Why reqwall?

Most rate limiting packages only support a single algorithm. `reqwall` gives you the flexibility to choose between two battle-tested algorithms depending on your use case — all with zero external dependencies and a simple, intuitive API.

---

## Features

- Two algorithms — Token Bucket and Sliding Window
- Zero external dependencies — pure in-memory storage
- TypeScript support out of the box
- Simple, Express-native middleware API
- Configurable per route or globally
- Meaningful 429 responses with `retryAfter` header
- Lightweight — no Redis, no database required

---

## Installation

```bash
npm install reqwall
```

---

## Quick Start

```ts
import express from 'express';
import { reqwall } from 'reqwall';

const app = express();

app.use(reqwall({
  algorithm: 'token-bucket',
  maxTokens: 100,
  windowMs: 60000,
  refillRate: 10
}));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);
```

---

## Usage

### Global Rate Limiting

Apply `reqwall` globally to protect your entire API:

```ts
app.use(reqwall({
  algorithm: 'sliding-window',
  maxTokens: 100,
  windowMs: 60000
}));
```

### Per-Route Rate Limiting

Apply different limits to different routes:

```ts
// Strict limit on login route
app.post('/login', reqwall({
  algorithm: 'sliding-window',
  maxTokens: 5,
  windowMs: 60000
}), (req, res) => {
  res.json({ message: 'logged in' });
});

// More relaxed limit on search route
app.get('/search', reqwall({
  algorithm: 'token-bucket',
  maxTokens: 50,
  windowMs: 60000,
  refillRate: 10
}), (req, res) => {
  res.json({ results: [] });
});
```

---

## Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `algorithm` | `'token-bucket' \| 'sliding-window'` | Yes | — | The rate limiting algorithm to use |
| `maxTokens` | `number` | Yes | — | Maximum number of requests allowed per window |
| `windowMs` | `number` | No | `60000` | Time window in milliseconds (default: 1 minute) |
| `refillRate` | `number` | No | `10` | Tokens to refill per window *(token-bucket only)* |

---

## Algorithms

### Token Bucket

The token bucket algorithm maintains a bucket of tokens per user. Each request consumes one token. Tokens refill continuously over time based on `refillRate` and `windowMs`.

**Best for:** APIs where occasional bursts are acceptable — chat APIs, search endpoints, general purpose APIs.

```ts
app.use(reqwall({
  algorithm: 'token-bucket',
  maxTokens: 100,   // bucket holds 100 tokens
  windowMs: 60000,  // per minute
  refillRate: 10    // refill 10 tokens per minute
}));
```

**How it works:**
1. User starts with a full bucket of `maxTokens` tokens
2. Each request deducts 1 token
3. Tokens refill continuously at a rate of `refillRate` per `windowMs`
4. When the bucket is empty, requests are rejected with `429`

---

### Sliding Window

The sliding window algorithm tracks the exact timestamp of every request. On each incoming request, it removes timestamps older than `windowMs` and checks if the remaining count is within `maxTokens`.

**Best for:** Strict APIs where boundary exploits must be prevented — payment APIs, authentication endpoints, sensitive operations.

```ts
app.use(reqwall({
  algorithm: 'sliding-window',
  maxTokens: 100,  // max 100 requests
  windowMs: 60000  // per rolling minute
}));
```

**How it works:**
1. Every request's timestamp is stored per user
2. On each request, timestamps older than `windowMs` are discarded
3. If remaining count is below `maxTokens` — request is allowed
4. If at limit — request is rejected with `429`

---

### Choosing an Algorithm

| | Token Bucket | Sliding Window |
|---|---|---|
| Burst friendly | Yes | No |
| Boundary exploit | None | None |
| Strict enforcement | Medium | Strict |
| Memory usage | Low | Higher (stores timestamps) |
| Best for | General APIs | Sensitive endpoints |

---

## Response Format

When a request is rate limited, `reqwall` returns:

**Status:** `429 Too Many Requests`

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60000
}
```

| Field | Description |
|-------|-------------|
| `error` | Short error label |
| `message` | Human-readable message |
| `retryAfter` | Milliseconds until the window resets |

---

## TypeScript Support

`reqwall` is written in TypeScript and ships with full type definitions. You get autocomplete and type safety out of the box — no `@types` package needed.

```ts
import { reqwall, RateLimiterOptions } from 'reqwall';

const options: RateLimiterOptions = {
  algorithm: 'token-bucket',
  maxTokens: 100,
  windowMs: 60000,
  refillRate: 10
};

app.use(reqwall(options));
```

---

## How Users Are Identified

By default, `reqwall` identifies users by their **IP address** (`req.ip`). No authentication or setup required.

If `req.ip` is unavailable, it falls back to `req.socket.remoteAddress`. If both are unavailable, it falls back to `'unknown'`.


---

## Limitations

Since `reqwall` uses **in-memory storage**, there are a few things to be aware of:

- **No persistence** — rate limit counters reset when your server restarts
- **Single process only** — does not work across multiple server instances or clusters
- **Memory growth** — in high-traffic scenarios, the in-memory store will grow. A cleanup mechanism is on the roadmap.

For production deployments with multiple instances, consider a Redis-backed solution like [`rate-limiter-flexible`](https://www.npmjs.com/package/rate-limiter-flexible).

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

MIT © [Ifechukwu Nwokedi Emmanuel](https://github.com/PerryAlex-hub)