# ParishConnect — Runnable Laravel + React Project

This project implements the current ParishConnect scope: user/role management, parishioner information, appointments, facility reservations, ministries, and announcements. Backend and frontend are separate.

## Requirements
- PHP 8.2+
- Composer 2
- MySQL/MariaDB
- Node.js 20+ and npm

## 1. Database
Create a MySQL database named `parish_connect`. In XAMPP/phpMyAdmin you can create it from the Databases tab.

## 2. Backend
```bash
cd parish-connect-backend
copy .env.example .env       # Windows CMD
# cp .env.example .env       # macOS/Linux
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
Backend: http://127.0.0.1:8000

If MySQL has a password, edit DB_USERNAME and DB_PASSWORD in `.env` before migrating.

## 3. Frontend
Open a second terminal:
```bash
cd parish-connect-frontend
copy .env.example .env       # Windows CMD
# cp .env.example .env
npm install
npm run dev
```
Frontend: http://localhost:5173

## Demo accounts
Password for all seeded accounts: `password123`
- priest@parishconnect.test
- secretary@parishconnect.test
- coordinator@parishconnect.test
- parishioner@parishconnect.test

## Production build
Frontend: `npm run build`; deploy the generated `dist/` directory to your static web host.
Backend: configure production `.env`, run `composer install --no-dev --optimize-autoloader`, `php artisan migrate --force`, and point the web server document root to `parish-connect-backend/public`. Run `php artisan config:cache` and `php artisan route:cache`.

## Important
Do not use the demo passwords in production. Set APP_DEBUG=false, use HTTPS, and create strong production credentials.
