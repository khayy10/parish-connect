# ParishConnect — registration, login, and connection fix

**Target website:** https://parish-connect-kb48.vercel.app/

**Architecture:** React/Vite on Vercel → Vercel same-origin `/api/*` rewrite → Laravel API on Render → MySQL (for example Aiven). Both backends and database must be live. Uploading only the React project cannot repair a missing Render service or an unconfigured database.

## What was fixed

1. Vercel `/api/*` requests now route to the expected Render API host through the **same-origin proxy** (`vercel.json`), including on Vercel previews. This avoids browser cross-origin connection failures. If your actual Render hostname is different, **replace `parish-connect-backend.onrender.com` in BOTH vercel.json files before deploying**.
2. Frontend always calls `/api` in production, rather than relying on a potentially stale `VITE_API_URL` build variable; local Vite dev server proxies `/api` to `http://127.0.0.1:8000`.
3. Better error messages for 422 validation, 429 throttling, 5xx backend errors and timeouts. Logged-in sessions are checked against `/api/me`.
4. Registration and login validate email, create a parishioner record, issue Laravel Sanctum bearer tokens, and preserve user roles.
5. Protected priest-only `POST /api/staff/register` now exists to support the existing staff form. Staff self-registration is NOT public.
6. Database configuration now explicitly supports MySQL, including an optional Aiven SSL certificate. CORS supports exact allowed origins for the production and preview frontend URLs.
7. New `GET /api/health` checks both Laravel and the live DB without revealing connection secrets.

## STEP 1 — Deploy Laravel backend to Render FIRST

Push this project's updated files to your GitHub repository. In Render, configure the **existing backend web service** (or create a new service):

- Runtime: **Docker**
- Root Directory: **`parish-connect-backend`**
- Dockerfile Path: `Dockerfile` (relative to that root)
- Port: **`10000`** (Dockerfile listens on 10000)
- Health Check Path: `/up` (only verifies the app starts; `/api/health` also verifies database)

In **Render > Environment**, set these variables using your OWN actual values:

```dotenv
APP_NAME=ParishConnect
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_URL=https://parish-connect-backend.onrender.com
FRONTEND_URLS=https://parish-connect-kb48.vercel.app,https://parish-connect-kb48-pqkkn4k8f-denkhayla-6282.vercel.app
DB_CONNECTION=mysql
DB_HOST=YOUR_ACTUAL_MYSQL_HOST
DB_PORT=YOUR_ACTUAL_MYSQL_PORT
DB_DATABASE=YOUR_ACTUAL_MYSQL_DATABASE
DB_USERNAME=YOUR_ACTUAL_MYSQL_USERNAME
DB_PASSWORD=YOUR_ACTUAL_MYSQL_PASSWORD
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
MIGRATE_ON_START=true
```

Replace placeholders; do not literally type `YOUR_ACTUAL_...`. Generate APP_KEY locally with `php artisan key:generate --show` (do not change an existing production key casually). **Keep production values in Render Environment; never commit them or send them in screenshots.** If you previously set `APP_URL=http://localhost:8000` or `APP_DEBUG=true`, update them in Render.

**If Aiven MySQL requires a TLS CA certificate**, this package includes the existing public `parish-connect-backend/certs/ca.pem`. Add this extra environment variable in Render:

```dotenv
MYSQL_ATTR_SSL_CA=/var/www/html/certs/ca.pem
```

`DB_SSL_CA` is also accepted as an alternative key. You must use the CA certificate belonging to **your** database instance; an unrelated certificate will fail. Do not add both with different values.

`MIGRATE_ON_START=true` runs `php artisan migrate --force` on container startup. It **adds any missing tables without dropping existing data**. Do **not** run `migrate:fresh` on a database with real users.

After successful deployment, test in a browser:

- `https://parish-connect-backend.onrender.com/up` — backend is running.
- `https://parish-connect-backend.onrender.com/api/health` — must say `"status":"ok","database":"connected"` and respond HTTP 200.

If `/api/health` responds **503**, check DB credentials, network allowlist, Aiven TLS certificate, and Render logs. If the browser cannot open the Render domain at all, check that the Render service exists and the URL is correct.

## STEP 2 — Deploy frontend to Vercel

**Preferred setup:** Existing Vercel project → Settings → Build and Deployment:

- Repository: your GitHub repo with the updated source
- Root Directory: **`parish-connect-frontend`**
- Framework: **Vite**
- Install: `npm ci`
- Build: `npm run build`
- Output Directory: `dist`

The frontend directory has its own `vercel.json` with `/api` proxy and React SPA fallback. Push the code and redeploy production. If you instead set **Root Directory to the repository root** (`.`), use the top-level `vercel.json`; it has explicit install/build commands for the frontend subfolder.

In Vercel → Settings → Environment Variables, **remove an old/wrong `VITE_API_URL`** if present (the fixed production frontend uses `/api` anyway). No DB password or APP_KEY should exist in Vercel frontend environment.

After redeploy, verify:

1. `https://parish-connect-kb48.vercel.app/api/health` responds **HTTP 200** with `{"status":"ok","database":"connected"}`.
2. Open `https://parish-connect-kb48.vercel.app/register` and register a **new** email and password of at least 8 characters.
3. Success redirects to `/login`; sign in with the exact new credentials; dashboard should open.
4. Refresh the page and check that the session stays signed in.
5. If you have an existing priest account, check the protected **Register Parish Staff** form.

**Diagnostic meanings:**

- **404 from `/api/health`**: incorrect Vercel Root Directory/rewrite or Render API path.
- **502 / 504**: Render API target not reachable (or still starting). Verify backend URL and Render deployment.
- **503 with `database: unavailable`**: MySQL/Aiven config, credentials, TLS or network failure.
- **422 on register**: validation error (email already exists, password too short, invalid email, etc.).
- **401 on `/api/me`**: invalid or expired bearer token; sign in again.
- **500 on register/login**: consult Render logs; common causes include database migrations not applied or table permissions.

## Local development (XAMPP)

Terminal 1:

```bash
cd parish-connect-backend
# copy .env.example .env  (Windows; configure local DB)
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:

```bash
cd parish-connect-frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The local Vite proxy forwards `/api` to Laravel automatically.

## Security and important limitations

- The original uploaded ZIP included a local `.env`, Git metadata, dependencies and log files. **The fixed ZIP excludes those files.** It includes only `.env.example` (no credentials) plus the CA certificate.
- Do not use the seeded/demo credentials from the previous README in production. Do not seed demo users in production. Create staff accounts through an authenticated priest account.
- The code was syntax-checked and Laravel returned a correct CORS preflight response. A full live registration and login test needs your running Render service and real database; those cannot be verified just from this ZIP.
- PHP and Node runtime in this analysis environment do not contain all native extensions required for full local end-to-end testing; Render's Dockerfile installs the PHP extensions and Vercel `npm ci` installs the platform-specific Node dependencies.
