const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/hackmate';
// mongodb-memory-server defaults its dbpath to the OS tmp dir, which can be a
// tiny tmpfs here — use a persistent workspace dir on real disk instead.
const MEMORY_DBPATH = path.join(os.homedir(), 'workspace', '.cache', 'hackmate-mongo');

let memoryServer = null;
let migrationsDone = false;

// One-time, idempotent migrations that run after a successful connect
// (both the long-lived server and the serverless function go through here).
async function runMigrations() {
  if (migrationsDone) return;
  migrationsDone = true;

  // eslint-disable-next-line global-require
  const Team = require('./models/Team');
  // eslint-disable-next-line global-require
  const TeamRequest = require('./models/TeamRequest');
  // eslint-disable-next-line global-require
  const { generateUniqueJoinCode } = require('./utils/joinCode');

  // Drop the old dedup index from before request kinds existed
  // (replaced by the two kind-specific partial unique indexes in the schema).
  try {
    await TeamRequest.collection.dropIndex('team_1_toUser_1');
  } catch (err) {
    // Already gone — nothing to do.
  }

  // Backfill joinCode on teams created before invite codes existed.
  // eslint-disable-next-line no-console
  const missing = await Team.find({
    $or: [{ joinCode: { $exists: false } }, { joinCode: null }],
  }).select('_id');
  for (const team of missing) {
    // eslint-disable-next-line no-await-in-loop
    team.joinCode = await generateUniqueJoinCode(Team);
    // eslint-disable-next-line no-await-in-loop
    await team.save();
  }
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.log(`[db] backfilled joinCode for ${missing.length} team(s)`);
  }
}

async function tryConnect(label, uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  // eslint-disable-next-line no-console
  console.log(`[db] connected (${label})`);
  await runMigrations();
}

async function connectDB() {
  const candidates = [];
  if (process.env.MONGODB_URI) {
    candidates.push(['MONGODB_URI env', process.env.MONGODB_URI]);
  }
  candidates.push(['local default mongodb://127.0.0.1:27017/hackmate', LOCAL_URI]);

  for (const [label, uri] of candidates) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await tryConnect(label, uri);
      return mongoose.connection;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`[db] ${label} unavailable: ${err.message}`);
    }
  }

  // Final fallback: in-memory MongoDB so the app always works locally.
  // eslint-disable-next-line no-console
  console.log('[db] falling back to mongodb-memory-server…');
  // eslint-disable-next-line global-require
  const { MongoMemoryServer } = require('mongodb-memory-server');
  fs.mkdirSync(MEMORY_DBPATH, { recursive: true });
  memoryServer = await MongoMemoryServer.create({ instance: { dbPath: MEMORY_DBPATH } });
  await tryConnect('mongodb-memory-server (in-memory)', memoryServer.getUri());
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
