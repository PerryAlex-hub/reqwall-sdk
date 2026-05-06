import express from 'express';
import { reqwall } from '../src/index';

const app = express();

app.use(express.json());

// Test token bucket
app.get('/token-bucket', reqwall({
  algorithm: 'token-bucket',
  maxTokens: 15,
  windowMs: 60000,
  refillRate: 5
}), (req, res) => {
  res.json({ message: 'token bucket - request allowed' });
});

// Test sliding window
app.get('/sliding-window', reqwall({
  algorithm: 'sliding-window',
  maxTokens: 5,
  windowMs: 60000
}), (req, res) => {
  res.json({ message: 'sliding window - request allowed' });
});

app.listen(5000, () => {
  console.log('reqwall test server running on port 5000');
});