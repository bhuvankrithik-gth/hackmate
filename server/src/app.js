// Express app only — no side effects (no DB connect, no listen).
// Used by server/src/index.js (local dev) and api/index.js (Vercel serverless).
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

// CLIENT_ORIGIN may be a comma-separated list in production
// (e.g. "https://hackmate.vercel.app,http://localhost:5173").
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Rate-limit auth endpoints: 100 requests per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  max: 100, // v6 option name, harmless on v7+
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ error: 'Too many requests, please try again later.' }),
});
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'hackmate-server' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/hackathons', require('./routes/hackathons'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
