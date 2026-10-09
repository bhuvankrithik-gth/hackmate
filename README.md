# HackMate — Find your team. Win your hackathon.

A hackathon team-formation platform for college students. Students register with their skills, join hackathons, and form teams by searching for people with the skills their team is missing. Hosts create and manage hackathons.

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion + React Router, on port 5173 |
| Backend  | Node.js + Express + Mongoose REST API, on port 5000 |
| Database | MongoDB (Mongoose). Uses `MONGODB_URI` from `.env`, else `mongodb://127.0.0.1:27017/hackmate`, else an embedded in-memory MongoDB (via `mongodb-memory-server`) so it always runs locally |
| Auth     | JWT (7-day expiry) + bcrypt (12 rounds), role-based protection (`student` / `host`) on backend middleware AND frontend routes |

## Quick start

```bash
cd ~/workspace/hackmate
npm run install:all   # installs server + client deps (and concurrently for the root)
npm run seed          # seeds the database, prints demo credentials
npm run dev           # starts API (5000) + web app (5173) together
```

Open http://localhost:5173. `npm run build` builds the client for production.

## Environment variables

Copy `server/.env.example` to `server/.env` and adjust:

```
PORT=5000
MONGODB_URI=            # optional; defaults to mongodb://127.0.0.1:27017/hackmate, then in-memory fallback
JWT_SECRET=change-me    # required in production
CLIENT_ORIGIN=http://localhost:5173
```

## Demo credentials (created by `npm run seed`)

- Host: `host@hackmate.demo` / `hackmate123`
- Students: `student1@hackmate.demo` … `student12@hackmate.demo` / `hackmate123`

Seed data: 1 host, 12 students with varied skills/colleges, 5 hackathons (2 open, 1 closing within 24h, 2 closed), several teams (one full), pending/accepted/declined team requests, announcements and notifications.

## Features

**Students** — browse hackathons (search + skill/status/date filters, live registration countdown), register, create teams with missing-skill lists, find teammates with an animated Skill Match % ring (red <40, orange 40–70, green >70), send/accept/decline team requests, requests inbox (sent/received), My Team page (members, open spots, skill gap), profile editing, notification bell.

**Hosts** — dashboard with stats, create/edit/delete hackathons, set registration + team-formation deadlines (backend rejects registrations, team creation and team requests after deadlines pass), manual open/close registration, participant/team views with filters, announcements to participants, CSV participant export.

**Platform** — neon purple/cyan hacker-culture design with glassmorphism and animated particle background, dark/light toggle (saved in localStorage), responsive layout, loading skeletons, toasts, empty states, form validation.

## Project layout

```
hackmate/
├── CONTRACT.md          # API + auth contract shared by client and server
├── package.json         # root scripts (dev / seed / build / install:all)
├── client/              # React + Vite + Tailwind frontend
│   └── src/{api,components,context,pages,utils}
└── server/              # Express + Mongoose backend
    ├── seed.js          # npm run seed
    ├── .env.example
    └── src/{models,routes,controllers,middleware,services,utils}
```

## API overview

Auth: `POST /api/auth/register/student`, `POST /api/auth/register/host`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer token).
Hackathons: `GET /api/hackathons?…`, `GET /api/hackathons/:id`, `POST /api/hackathons/:id/register` (student), host CRUD + `/:id/participants`, `/:id/teams`, `/:id/participants/export` (CSV), `/:id/announcements`.
Teams: `POST /api/teams`, `GET /api/teams/my`, `GET /api/teams/:id`, `PUT /api/teams/:id`, `POST /api/teams/:id/close`, `GET /api/teams/search/candidates?…`.
Requests: `POST /api/requests`, `GET /api/requests?tab=sent|received`, `PUT /api/requests/:id/accept|decline`, `DELETE /api/requests/:id`.
Users/notifications: `GET|PUT /api/users/me`, `GET /api/notifications`, `PUT /api/notifications/:id/read`, `GET /api/notifications/unread-count`.

All errors are `{error, details?}` with proper HTTP codes. Auth routes are rate-limited (100 requests / 15 min).
