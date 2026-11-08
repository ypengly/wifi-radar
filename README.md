# WiFi Radar (Stages 1–2)

Web dashboard + API for Wi-Fi discovery. **A browser cannot scan Wi-Fi**, so scans come from a paired _scanner agent_; the web app only displays what agents report. Demo mode is clearly labelled and never stored.

## What works in this build

- Auth (single admin from `.env`, signed httpOnly cookie), device pairing (6-digit, 10-minute, single-use code → per-device token, stored hashed)
- Zod-validated scan ingest API → Postgres via Prisma (all 9 requested tables + enums)
- Dashboard: summary counts, animated radar, live/demo switch, scan states, auto-refresh with interval
- Nearby networks: search, sort, 8 filters, detail panel (BSSID, dBm/%, band, channel, security, first/last seen)
- Delete-all-history endpoint; PWA manifest; Docker; Linux agent (`agents/linux/wifi_agent.py`)

## Not built yet (by stage)

Map + AP geolocation providers (4), analytics charts & signal-history graph (5), scan history & settings pages, WebSocket push (UI polls for now), Android/Windows/macOS scanners (6), rate limiting, tests, service worker/icons (7). Disabled nav items say "soon". Distance is never estimated and AP locations are all `UNKNOWN` until a provider exists.

## Run

```bash
cp .env.example .env        # set SESSION_SECRET (openssl rand -hex 32), ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d db
npm install
npx prisma migrate dev --name init   # creates the migration (needs internet for Prisma engines)
npm run dev                          # http://localhost:3000
```
If another local service already uses port `5432`, set `DB_PORT=5433` in `.env` and update `DATABASE_URL` to use port `5433`.
Or everything in Docker: `docker compose up --build` (uses `db push` until you've committed a migration).

## Connect a real scanner (Linux)

1. Sign in at `/login`, then get a code: `curl -b cookiejar -X POST localhost:3000/api/v1/devices/pair-code` (a Settings UI for this is planned).
2. `python3 agents/linux/wifi_agent.py pair --server http://localhost:3000 --code 123456`
3. `python3 agents/linux/wifi_agent.py run --interval 30`

## Honest limits

Android throttles scans (~4 per 2 min foreground); iOS has no public nearby-scan API; macOS hides SSIDs without Location permission; radar distance = signal strength only; direction on the radar is arbitrary. Not yet verified in this build: I couldn't run `next build` offline, so run `npm run typecheck` after `prisma generate`.
See `docs/API.md`.
