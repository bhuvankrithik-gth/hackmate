# Deploying HackMate to Vercel + MongoDB Atlas

This deploys HackMate as **one Vercel project**: the React frontend as static
files and the Express API as a serverless function (`api/index.js`), sharing
one domain so no CORS juggling is needed.

`vercel.json` at the repo root is already set up for this:

- `installCommand`: `npm run install:all` (installs server + client deps)
- `buildCommand`: `npm run build` (Vite production build of the client)
- `outputDirectory`: `client/dist`
- `/api/*` → the serverless Express function; everything else → `index.html`
  (client-side routing)

## 1. Create the MongoDB Atlas database

1. Sign in at [cloud.mongodb.com](https://cloud.mongodb.com) (you already have
   an account) → **Create** a free M0 cluster (any nearby region, e.g. Mumbai).
2. **Database Access** → Add a database user with a strong password
   (e.g. `hackmate`) and the **readWrite** role on the cluster.
3. **Network Access** → **Add IP Address** → **Allow access from anywhere**
   (`0.0.0.0/0`). Serverless functions have no fixed IP, so this is required.
4. **Database** → **Connect** → **Drivers** (Node.js) → copy the connection
   string. It looks like:
   `mongodb+srv://hackmate:<password>@cluster0.xxxxx.mongodb.net/hackmate?retryWrites=true&w=majority`

## 2. Seed the production database (one time)

The serverless API needs a real database — the in-memory fallback can't work
on Vercel. Run the seed script locally, pointed at Atlas:

```bash
cd ~/workspace/hackmate
MONGODB_URI="mongodb+srv://hackmate:<password>@cluster0.xxxxx.mongodb.net/hackmate?retryWrites=true&w=majority" \
  npm run seed
```

This creates the demo host + 12 students + hackathons + teams and prints the
demo credentials. **Run this against Atlas only once** (re-running wipes and
recreates the seed data).

## 3. Deploy on Vercel

1. Push the project to a GitHub repo (you already have a GitHub account):
   ```bash
   cd ~/workspace/hackmate
   git init && git add . && git commit -m "HackMate: deploy-ready"
   # create an empty repo on github.com, then:
   git remote add origin https://github.com/<you>/hackmate.git
   git push -u origin main
   ```
2. On [vercel.com](https://vercel.com) → **Add New… → Project** → import the
   repo. The root `vercel.json` is picked up automatically.
3. In **Environment Variables**, add:
   - `MONGODB_URI` = the Atlas connection string from step 1
   - `JWT_SECRET` = a long random string (generate one, e.g.
     `openssl rand -hex 32`)
   - `CLIENT_ORIGIN` = your Vercel domain, e.g.
     `https://hackmate.vercel.app` (no trailing slash)
4. **Deploy**. When it finishes, open the URL — the app is live.

## 4. Sanity check after deploy

- Visit the site and register a student account (or log in with a demo
  student from the seed output).
- Hit `/api/health` — it should return
  `{"ok":true,"service":"hackmate-server"}`.

## Notes

- Atlas free tier + Vercel hobby tier both cover this comfortably.
- First cold start of the API function takes a couple of seconds (MongoDB
  connection is cached after that).
- To redeploy later, just `git push` — Vercel rebuilds automatically.
- `server/.env` is for local dev only; never commit it.
