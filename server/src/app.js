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

// Rate-limit auth writes: 300 POSTs per 15 minutes per IP.
// (Was 100 for ALL /api/auth requests including GET /auth/me — on a shared
// campus NAT, many students share one public IP and normal page loads kept
// burning the budget, so legitimate logins started failing with 429.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  max: 300, // v6 option name, harmless on v7+
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ error: 'Too many requests, please try again later.' }),
});
app.use('/api/auth', (req, res, next) =>
  req.method === 'POST' ? authLimiter(req, res, next) : next()
);

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
