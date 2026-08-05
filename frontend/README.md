# Inventory Frontend

Minimal React + Vite UI for the inventory backend.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # optional — defaults to Vite proxy
npm run dev
```

App runs at `http://localhost:5173`.

**Start the backend first** on port 3000 (`cd backend && npm run dev`).

## Pages by role

| Role    | Pages                              |
|---------|------------------------------------|
| All     | Login, Products (read-only list)   |
| MANAGER | Manage (CRUD), Logs                |
| STAFF   | Stock In / Out                     |
| USER    | Buy products, view order history   |

## Demo logins

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| MANAGER | manager@example.com | password123 |
| STAFF   | staff@example.com   | password123 |
| USER    | user@example.com    | password123 |

## Registration

Regular users can create their own account from the app registration page. MANAGER and STAFF accounts are not available for self-registration and must be seeded or managed through the backend.

## API connection

By default, requests go to `/api/*` and Vite proxies them to `http://localhost:3000`.

To call the backend directly, set in `.env`:

```
VITE_API_URL=http://localhost:3000
```
