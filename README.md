# Inventory

Monorepo-style layout:

| Folder      | Description                          |
|-------------|--------------------------------------|
| `backend/`  | Express + Prisma inventory API       |
| `frontend/` | React + Vite minimal UI              |

## Backend quick start

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

## Frontend quick start

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (backend must be running on port 3000).

See [`backend/README.md`](./backend/README.md) for API docs and [`backend/PROGRESS.md`](./backend/PROGRESS.md) for the implementation checklist (useful after session resets).
