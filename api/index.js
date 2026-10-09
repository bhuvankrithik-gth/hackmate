// Vercel serverless entry for the HackMate API.
// Requires env vars on Vercel: MONGODB_URI (Atlas), JWT_SECRET, CLIENT_ORIGIN.
const { connectDB } = require('../server/src/dbConnect');
const app = require('../server/src/app');

// Cache the connection promise across warm invocations.
let ready = null;
const ensureDb = () => {
  if (!ready) {
    ready = connectDB().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
};

module.exports = async (req, res) => {
  try {
    await ensureDb();
    return app(req, res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api] DB connection failed:', err && err.message);
    res.status(503).json({ error: 'Database unavailable, please try again.' });
  }
};
