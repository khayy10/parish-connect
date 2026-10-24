# ParishConnect — FIX & DEPLOY GUIDE (2026-10-24)

Target frontend: https://parish-connect-kb48.vercel.app
Expected Render backend from the supplied project: https://parish-connect-backend.onrender.com

**IMPORTANT:** Check the actual Web Service URL shown in YOUR Render dashboard. If it is different, replace that URL in BOTH `vercel.json` files before pushing. This is not connected to your live hosting automatically. A 404 error after redeployment requires checking the URLs and the actual Vercel deployment, not repeating the signup form.

## 1) What's changed

- Login now displays **Account Role** with all 4 roles. The server checks that the selected role matches the user stored in the `users` table **after verifying the password**.
- Public registration displays **Register As**. Parishioners can self-register. Staff role selections show a clear notice because only a Parish Priest can authorize new staff. Server validation rejects fake staff self-registration too.
- Live **API Status** indicator on both pages calls `/health` and identifies API 404, server unavailable, and database unavailable.
- Passwords are hashed, duplicate email validation stays enabled, parishioner user/profile creation uses a transaction, and a Sanctum token is returned on login.
- Staff registration stays protected on both the frontend and Laravel `auth:sanctum` + `role:priest` middleware.
- Optional `VITE_API_URL` override now works in production if the Vercel `/api` rewrite fails.
- A first priest can be provisioned using a one-time seed with private environment variables; production no longer creates insecure demo accounts.
- Fixed permissions so parishioners cannot approve requests by editing status/admin notes on appointments or reservations.

## 2) Render: deploy backend first

In Render, use the **existing Web Service**:

- Runtime: Docker
- Root Directory: `parish-connect-backend`
- Dockerfile: `Dockerfile` (relative to backend folder)
- Health Check Path: `/up`
- Port: Dockerfile listens on `10000`

Set **real** Render Environment variables; do not share screenshots with passwords:

```
APP_NAME=ParishConnect
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_EXISTING_OR_NEW_KEY
APP_URL=https://YOUR-REAL-RENDER-HOST.onrender.com
FRONTEND_URLS=https://parish-connect-kb48.vercel.app,https://parish-connect-kb48-pqkkn4k8f-denkhayla-6282.vercel.app
DB_CONNECTION=mysql
DB_HOST=YOUR_TIDB_MYSQL_HOST
DB_PORT=YOUR_TIDB_MYSQL_PORT
DB_DATABASE=parish_connect_db
DB_USERNAME=YOUR_TIDB_USERNAME
DB_PASSWORD=YOUR_TIDB_PASSWORD
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
MIGRATE_ON_START=true
BOOTSTRAP_PRIEST_ON_START=false
```

Use the exact DB host, port, database, and username from **TiDB Cloud → Connect**, not example strings. The screenshot shows the schema `parish_connect_db`; confirm it matches the database configured on Render. TiDB Cloud may require TLS — configure the correct CA path if required using `MYSQL_ATTR_SSL_CA=/var/www/html/certs/ca.pem`, and ensure that **that CA really belongs to your current DB**. Do not assume an old Aiven CA is correct for TiDB.

`APP_KEY`: if there is already a working production key, keep it unchanged. Otherwise generate with `php artisan key:generate --show` locally (never paste it in chat or commit it).

`MIGRATE_ON_START=true` runs `php artisan migrate --force` without dropping existing tables. Never run `migrate:fresh` on production.

Test backend using the **actual Render URL**:
- `/up` should respond from Laravel
- `/api/health` must return JSON like `{"status":"ok","database":"connected"}` with HTTP 200
- If 404 -> Laravel routes not deployed or backend URL wrong.
- If 503 -> database config, TLS or connectivity problem.
- If 5xx -> check Render Logs, database migrations, APP_KEY.

### First Parish Priest (only if no priest account exists)

If TiDB `users` table has no row with `role='priest'`, provision one using Render private Environment values:
```
INITIAL_PRIEST_NAME=Parish Priest
INITIAL_PRIEST_EMAIL=an-email-you-control@example.org
INITIAL_PRIEST_PASSWORD=a-unique-secret-password-12-or-more-characters
BOOTSTRAP_PRIEST_ON_START=true
```
Use your actual email and a strong unique password, not these placeholders. Trigger a backend **Deploy/Redeploy** with `MIGRATE_ON_START=true`. On startup the Docker command runs migrations first, then `StaffSeeder` once. The seeder does not create anything if a priest already exists. Once it has worked, change `BOOTSTRAP_PRIEST_ON_START=false`, remove the password environment value, and redeploy. Sign in as Parish Priest and use **Register Parish Staff** to create secretary and coordinator accounts.

If a priest user exists but cannot log in, do **not** run the bootstrap blindly. Correct its credentials through a secure authorized admin procedure (do not post real password data here).

## 3) Vercel frontend — use ONE of these project setups

**Recommended (frontend subfolder is root)**
- Settings → Build and Deployment → Root Directory: `parish-connect-frontend`
- Framework: Vite
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- This uses `parish-connect-frontend/vercel.json`

**Alternative (repository root is root)**
- Root Directory: blank/repository root
- This uses top-level `vercel.json`, which builds `parish-connect-frontend` explicitly

Both `vercel.json` files have the API rewrite FIRST:
```
"source": "/api/:path*",
"destination": "https://parish-connect-backend.onrender.com/api/:path*"
```
And then a SPA fallback for React pages. If your backend URL differs, update **both** files. Verify the latest GitHub commit is the one Vercel deployed.

### VITE_API_URL — optional direct-Render fallback for persistent 404

The NEW code defaults to `/api` (Vercel proxy). In **Vercel → Environment Variables**, set:
- Key: `VITE_API_URL`
- Value: `/api` (for Vercel same-origin proxy)

If `https://parish-connect-kb48.vercel.app/api/health` is STILL 404 after confirming the rewrites and Root Directory, but `https://YOUR-REAL-RENDER-HOST.onrender.com/api/health` is working, you can bypass the rewrite:
- Key: `VITE_API_URL`
- Value: `https://YOUR-REAL-RENDER-HOST.onrender.com/api`
- Environments: Production and Preview
- Redeploy the frontend (Vite environment variables are read **during build**)

This direct option needs Render CORS to allow `https://parish-connect-kb48.vercel.app`, already included in `config/cors.php`. Do not use `https://api.example.com` or `localhost` in Vercel production. **Never** put DB secrets or APP_KEY in Vite/Vercel browser-accessible variables.

### Diagnose 404 without creating users

First open the following URLs in Chrome:
1. `https://YOUR-REAL-RENDER-HOST.onrender.com/api/health`
2. `https://parish-connect-kb48.vercel.app/api/health`

| Render `/api/health` | Vercel `/api/health` | Next action |
| --- | --- | --- |
| 200 JSON | 200 JSON | Register a new parishioner; test login |
| 200 JSON | 404 | Fix Vercel Root Directory or rewrite, OR use direct `VITE_API_URL` fallback |
| 404 | 404 | Verify the real Render service, deployed backend commit, and Laravel routes |
| 503 | 503 | Fix database credentials/TLS in Render |
| Network error | 404/502 | Render service/domain unavailable; check Render dashboard |

## 4) Push with Windows CMD

**Extract the new ZIP and copy its CONTENTS into your existing `C:\xampp\htdocs\PARISH-CONNECT` folder. KEEP existing `.git` and local `.env` files.** There must not be a double nested `PARISH-CONNECT\PARISH-CONNECT` folder.

```
cd /d C:\xampp\htdocs\PARISH-CONNECT
git status
git add -A
git diff --cached --name-only
git commit -m "Fix account roles login registration and API diagnostics"
git push origin main
```

Before committing, verify `git diff --cached --name-only` does **not** list `.env`, local database dumps, credentials, or unrelated private files. If a Git command reports `nothing to commit`, there is no new staged change; verify that you copied the updated files into the correct project folder and saved them.

Deploy the backend in Render and frontend in Vercel from the new `main` commit. A local Git push does NOT guarantee both live deployments succeeded.

## 5) Test real database saves in TiDB SQL Editor

```
USE parish_connect_db;
SELECT id, name, email, role, status, created_at
FROM users
ORDER BY created_at DESC LIMIT 20;

SELECT id, user_id, first_name, phone, created_at
FROM parishioners
ORDER BY created_at DESC LIMIT 20;
```

If `No database selected`, run the `USE parish_connect_db;` statement **first**, then rerun the SELECT. Your screenshot showed a `users` table; check that Render points at the SAME DB. Never SELECT or share raw password values.

## 6) Acceptance checklist

1. `/api/health` gives HTTP 200 and JSON database connected.
2. `/register` shows **Register As** role selector.
3. Choose Parishioner; new email and 8+ character matching password → HTTP 201; user and parishioner rows saved.
4. `/login` shows **Account Role** selector; select Parishioner → login works and dashboard loads.
5. Choose wrong role on login with valid password → role mismatch error, no token issued.
6. Choose staff on `/register` → clear staff-only notice; no anonymous privileged account creation.
7. Existing priest signs in with Parish Priest role, opens Register Parish Staff, creates secretary or coordinator → HTTP 201. That account can sign in with assigned role.
8. Staff-only routes reject parishioner tokens with HTTP 403.

## Verification limitations

PHP files were syntax checked. The uploaded ZIP's Windows `node_modules` lacks the native Linux binding needed for Vite to build inside this runtime; Vercel installs dependencies for its platform during deploy. Without your live Render/TiDB credentials and deployment access, a full real registration/login transaction cannot be verified here. Please verify the health endpoints and acceptance checklist after deployment. The package intentionally contains NO `.git`, `vendor`, `node_modules`, `dist`, local `.env`, or passwords.
