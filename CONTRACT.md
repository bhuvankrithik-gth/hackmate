# HackMate — Shared Contract (backend ↔ frontend)

Project root: `~/workspace/hackmate`
- Backend: `~/workspace/hackmate/server` — Node.js + Express + Mongoose REST API on **port 5000**
- Frontend: `~/workspace/hackmate/client` — React + Vite on **port 5173**, dev proxy `/api` → `http://localhost:5000`

## Auth
- Header: `Authorization: Bearer <token>` (JWT, 7-day expiry)
- `req.user = { id, role }` where role ∈ `student | host`
- Backend must implement `requireAuth` (any logged-in user) and `requireRole('student'|'host')` middleware.
- Frontend: `AuthContext` stores `{ token, user }` in localStorage (`hackmate_auth` key), axios/fetch interceptor adds the header. `ProtectedRoute` requires login; `RoleRoute` requires a role. Students never see host pages, hosts never see student pages (redirect to their own dashboard/landing).

## REST API (all under /api, JSON)

### Auth
- `POST /api/auth/register/student` body: `{name,email,password,college,branch,year,skills:[{name,level}],github,linkedin,bio}` → 201 `{token,user}`
- `POST /api/auth/register/host` body: `{name,organization,email,password}` → 201 `{token,user}`
- `POST /api/auth/login` body: `{email,password}` → 200 `{token,user}`
- `GET /api/auth/me` (auth) → 200 `{user}`
- Skill levels ∈ `Beginner | Intermediate | Advanced`
- User object NEVER includes passwordHash.

### Hackathons
- `GET /api/hackathons?search=&skill=&status=&from=&to=` → `{hackathons:[...]}` each with `participantCount`, `teamCount`, computed `status: 'open'|'closed'` (closed when `!isOpen || now > registrationDeadline`), `isRegistered` when authed student.
- `GET /api/hackathons/:id` → `{hackathon}` detail + `isRegistered`, `myTeam` (team id or null) for students.
- `POST /api/hackathons/:id/register` (student) → 200 `{message}`. Errors 400 if already registered, registration closed, or past `registrationDeadline`.
- `POST /api/hackathons` (host) body: `{title,description,bannerUrl,startDate,endDate,registrationDeadline,teamFormationDeadline,mode:'online'|'offline',venue,prize,teamSizeLimit,requiredSkills:[String]}`
- `PUT /api/hackathons/:id` (host, owner only)
- `DELETE /api/hackathons/:id` (host, owner only) — cascades teams/requests/announcements.
- `GET /api/hackathons/:id/participants?skill=&college=&search=` (host) → `{participants:[users without password]}`
- `GET /api/hackathons/:id/teams` (host) → `{teams:[populated members]}`
- `GET /api/hackathons/:id/participants/export` (host) → CSV file download (`Content-Type: text/csv`), columns: name,email,college,branch,year,skills,github,linkedin,registeredAt.
- `GET /api/hackathons/:id/announcements` (auth; students must be registered, host must own) → `{announcements}`
- `POST /api/hackathons/:id/announcements` (host) body `{title,body}` → creates Announcement + a Notification for every participant.

### Teams (student only)
- `POST /api/teams` body `{hackathonId,name,description,missingSkills:[{name}]}` → 201 `{team}`. Errors: not registered in hackathon; past `teamFormationDeadline`; already in a team for this hackathon; missingSkills max 10.
- `GET /api/teams/my?hackathonId=` → `{teams:[...]}` teams the student belongs to (optionally filtered).
- `GET /api/teams/:id` → `{team}` with populated `members` (name,email,college,skills,github,linkedin) and `openSpots`, `skillGap` (missing skills not covered by any member).
- `PUT /api/teams/:id` (owner only) `{name,description,missingSkills}`.
- `POST /api/teams/:id/close` (owner) → sets `isOpen=false`.
- `DELETE /api/teams/:id` (owner only).
- `GET /api/teams/search/candidates?hackathonId=&teamId=&skill=&search=&college=&sort=match` (student) → `{candidates:[{user:{...}, matchPercent, matchedSkills:[], missingSkills:[]}]}` sorted by matchPercent desc by default. Excludes current team members and the requester. Only students registered in the hackathon.
  - `matchPercent = round((matchedMissing / totalMissing) * 100)` where matchedMissing = candidate's skill names ∩ team's missingSkills. If team has 0 missing skills → matchPercent = 0.

### Team requests (student only)
- `POST /api/requests` body `{teamId,toUserId,message}` → 201 `{request}`. Errors: not owner/captain or not member; team closed/full; past teamFormationDeadline; toUser not registered in same hackathon; duplicate pending request; requesting self.
- `GET /api/requests?tab=sent|received` → `{requests:[populated team, fromUser, toUser]}`.
- `PUT /api/requests/:id/accept` (toUser only) → adds toUser to team members (respect teamSizeLimit via members.length + 1 <= teamSizeLimit... actually maxSize = teamSizeLimit; reject if full), sets request status accepted, creates notifications for both. If team becomes full → auto set isOpen=false.
- `PUT /api/requests/:id/decline` (toUser only).
- `DELETE /api/requests/:id` (fromUser only, pending only) — cancel.

### Users & notifications (auth)
- `GET /api/users/me` → `{user}`; `PUT /api/users/me` (student) editable: name,college,branch,year,skills,github,linkedin,bio.
- `GET /api/notifications` → `{notifications:[...]}` newest first.
- `PUT /api/notifications/:id/read` → 200.
- `GET /api/notifications/unread-count` → `{count}`.
- Notification: `{user,title,body,read,type,link,createdAt}`. Types: `team_request`, `request_accepted`, `request_declined`, `announcement`, `team_joined`.
  - `link` examples: `/requests`, `/teams/<id>`, `/hackathons/<id>`.

## Error format
All errors: `{error: "Human readable message", details?: [...]}` with proper HTTP codes (400 validation, 401 unauth, 403 forbidden, 404, 409 conflict, 429 rate limit, 500).

## Security
bcrypt (10+ rounds), JWT_SECRET from env, helmet, cors, express-rate-limit on `/api/auth/*` (e.g. 100 req/15min), input validation (express-validator), never leak passwordHash, Mongo injection-safe queries.

## Seed data
`npm run seed` (server): 1 host, 12 students (varied skills/levels/colleges), 5 hackathons (2 open, 1 closing soon — deadline within 24h, 2 closed), several teams (some full, some with open spots), pending + accepted team requests, announcements, notifications. Print credentials:
- host: `host@hackmate.demo / hackmate123`
- students: `student1@hackmate.demo` … `student12@hackmate.demo` / `hackmate123`

## Frontend pages & routes
- `/` Landing (hero, how-it-works, CTA, footer)
- `/login`, `/register` (student/host toggle)
- Student: `/dashboard` (redirect), `/hackathons`, `/hackathons/:id`, `/find-teammates?hackathonId=&teamId=`, `/teams/:id` (My Team), `/requests` (sent/received tabs), `/profile`, `/notifications`
- Host: `/host` (Host Dashboard: hackathon list + stats), `/host/hackathons/new`, `/host/hackathons/:id/edit`, `/host/hackathons/:id` (manage: participants, teams, announcements, export CSV)
- Shared components: Navbar (logo, links by role, notification bell w/ unread count, dark/light toggle persisted in localStorage `hackmate_theme`), AnimatedBackground (particles/gradient canvas), MatchRing (SVG circular progress; red <40, orange 40–70, green >70), CountdownTimer (live ticking to registrationDeadline), Skeleton loaders, Toast (react-hot-toast), EmptyState, ProtectedRoute, RoleRoute.
- Theme: Tailwind `dark` class strategy; neon purple (#a855f7 family) + cyan (#22d3ee) on dark glassmorphism cards; light mode variant of same theme.

## Run scripts (root package.json)
- `npm run dev` → concurrently starts server (`npm run dev` in /server → nodemon) and client (`npm run dev` in /client → vite).
- `npm run seed` → runs server seed.
- `npm run build` → builds client.
