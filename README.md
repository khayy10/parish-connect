# ParishConnect — React + Laravel (Roles, Login and Registration Fix)

Frontend: `parish-connect-frontend` (Vite/React, Vercel). Backend: `parish-connect-backend` (Laravel 12, Render). Database: MySQL-compatible database (such as TiDB Cloud).

## Roles and registration
- All users sign in by selecting the **same role saved in the database**: Parishioner, Parish Priest, Parish Secretary, or Ministry Coordinator.
- Public registration is for **Parishioner** only. An untrusted visitor cannot create a priest/staff account by changing the form payload.
- Staff accounts are created through **Register Parish Staff** while signed in as a Parish Priest.
- The first priest is provisioned via private Render environment values (`StaffSeeder`). See `DEPLOYMENT_FIX_GUIDE.md`. No public default passwords or demo accounts are generated.

## Local development (Windows CMD)
Backend (Terminal 1):
```
cd /d C:\xampp\htdocs\PARISH-CONNECT\parish-connect-backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```
Set valid DB_* variables in the backend `.env` **before** migrating. Do not run `migrate:fresh` on any database with data.

Frontend (Terminal 2):
```
cd /d C:\xampp\htdocs\PARISH-CONNECT\parish-connect-frontend
npm ci
npm run dev
```
Open http://localhost:5173. Vite routes `/api` to Laravel at 127.0.0.1:8000.

## Production
See **`DEPLOYMENT_FIX_GUIDE.md`** for the Vercel/Render root directory, environment variables, DB connections, first-priest setup, debugging persistent 404s, and Git commands.

**Never commit:** `.env`, database passwords, APP_KEY, or personally identifying test data. This package intentionally excludes the `.git` folder, `vendor`, `node_modules`, logs, and local `.env` values.
