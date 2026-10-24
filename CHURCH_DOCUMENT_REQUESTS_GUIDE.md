# ParishConnect — Church Symbol + Document Requests

This update adds a church symbol/logo to the title, login/register and browser favicon, plus **Church Document Requests** with database persistence.

## User-facing features

- Parishioners: Request Baptismal, Confirmation, Marriage, Burial, or Other Parish Records; see only their own requests and status/office remarks.
- Parish Priest & Parish Secretary: View all document requests, verify details, update request status, and leave remarks for parishioners.
- Statuses: Pending, Under Review, Ready for Pick-up, Released, Rejected.
- Official certificates are **NOT automatically generated or issued**. The parish office must validate the original records and its release requirements first.
- Ministry Coordinator: No document request access in this version.

## Files to copy

If using the PATCH ZIP, extract and copy the *contents of* the included `PARISH-CONNECT` folder into your existing:

`C:\xampp\htdocs\PARISH-CONNECT`

When Windows asks, choose **Replace matching files**. Never paste it inside another `PARISH-CONNECT` folder. Never delete your existing `.git`, `.env` or database. The patch updates these paths:

- `parish-connect-frontend/index.html`
- `parish-connect-frontend/public/parishconnect-mark.svg`
- `parish-connect-frontend/src/App.jsx`
- `parish-connect-frontend/src/layouts/Layout.jsx`
- `parish-connect-frontend/src/pages/Login.jsx`
- `parish-connect-frontend/src/pages/Register.jsx`
- `parish-connect-frontend/src/pages/DocumentRequests.jsx` (new)
- `parish-connect-frontend/src/assets/app.css` (includes Evergreen & Gold CSS)
- `parish-connect-backend/routes/api.php`
- `parish-connect-backend/app/Models/DocumentRequest.php` (new)
- `parish-connect-backend/app/Http/Controllers/DocumentRequestController.php` (new)
- `parish-connect-backend/database/migrations/2026_10_24_000001_create_document_requests_table.php` (new)

## Push to GitHub (Windows CMD)

```bat
cd /d C:\xampp\htdocs\PARISH-CONNECT
git status
git add parish-connect-frontend/src parish-connect-frontend/index.html parish-connect-frontend/public/parishconnect-mark.svg parish-connect-backend/routes/api.php parish-connect-backend/app/Models/DocumentRequest.php parish-connect-backend/app/Http/Controllers/DocumentRequestController.php parish-connect-backend/database/migrations/2026_10_24_000001_create_document_requests_table.php
git diff --cached --name-only
git commit -m "Add ParishConnect church document requests and logo"
git push origin main
```

Check that no secrets are staged before committing.

## IMPORTANT: Apply the new database migration on Render

Vercel publishes the frontend, **Render publishes the Laravel backend**; both must deploy the new GitHub commit. Existing TiDB records should remain intact because this is a *new migration*, not a replacement of existing tables.

1. In Render, open `parish-connect-backend`, verify it deploys the new commit successfully.
2. Run `php artisan migrate --force` **one time** in the backend environment (Render Shell, if available). **OR**, if your Dockerfile supports the documented setting, add Render environment variable `MIGRATE_ON_START=true`, then deploy the new commit. The supplied Dockerfile supports this flag.
3. Verify Render logs show the new `create_document_requests_table` migration succeeding. Once successful, set `MIGRATE_ON_START=false` to disable repeated migration attempts on service starts (ordinary Laravel migrations are idempotent but avoid unnecessary startup dependency).
4. Do **not** run `migrate:fresh`, `migrate:refresh`, or a database reset. Those commands can delete data.
5. Verify `/api/health` connects to the database (note: health check alone does not verify migration), then sign in and test `/document-requests`.

TiDB SQL Editor confirmation (first select the database):

```sql
USE parish_connect_db;
SHOW TABLES LIKE 'document_requests';
SELECT id, user_id, document_type, record_name, status, created_at
FROM document_requests
ORDER BY id DESC LIMIT 20;
```

## Role and workflow test

1. Register/login as Parishioner and open sidebar **Request Documents**. Submit a request.
2. Verify it appears in the parishioner's list with **Pending** status.
3. Login as Parish Secretary or Parish Priest; open **Document Requests**; set **Under Review** and save.
4. Login as the parishioner; only their request should appear with updated status.
5. Try opening or changing another account's request via API: it must not expose other users' records or permit a parishioner to change status.

## API routes

- `GET /api/document-requests` — Parishioner (own requests); Priest/Secretary (all)
- `POST /api/document-requests` — Parishioner only
- `PATCH /api/document-requests/{id}` — Priest/Secretary only

## Limitations

- No email or SMS messages are sent.
- No PDF is generated, no online document download or payment gateway is included.
- This package passed PHP, CSS, SVG, and JS/JSX parsing checks. Full `npm run build` and real Render/TiDB integration tests were not completed in this environment and must be verified on deployment.
