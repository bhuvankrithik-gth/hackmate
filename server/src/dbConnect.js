const fs = require('fs');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/hackmate';
// mongodb-memory-server defaults its dbpath to the OS tmp dir, which can be a
// tiny tmpfs here — use a persistent workspace dir on real disk instead.
const MEMORY_DBPATH = path.join(os.homedir(), 'workspace', '.cache', 'hackmate-mongo');

let memoryServer = null;

async function tryConnect(label, uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  // eslint-disable-next-line no-console
  console.log(`[db] connected (${label})`);
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
