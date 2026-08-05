# Inventory Management System — Implementation Checklist

> **For agents:** Read this file first on every session. Update checkboxes as you complete work.
> **Location:** All backend code lives in the `backend/` folder.
> Last updated: 2026-08-05

## Quick Start (when project is complete)

```bash
cd backend
npm install
cp .env.example .env          # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run seed                    # optional: demo users
npm run dev
```

---

## Project Setup

- [x] `package.json` with dependencies and scripts
- [x] `.env.example` with sample env vars
- [x] `README.md` with setup and API docs
- [x] `PROGRESS.md` (this file)

## Database (Prisma + MySQL)

- [x] `prisma/schema.prisma` — User, Product, InventoryLog, Order, OrderItem
- [x] Enums: Role (MANAGER, STAFF, USER), LogType (STOCK_IN, STOCK_OUT)
- [x] `src/prisma/client.js` — Prisma client singleton
- [x] `prisma/seed.js` — demo users (manager, staff, user)

## Core App

- [x] `src/app.js` — Express app, JSON middleware, routes
- [x] `src/server.js` — HTTP server entry point

## Middleware

- [x] `src/middleware/auth.js` — JWT verify + role authorization

## Services (business logic)

- [x] `src/services/auth.service.js` — login, bcrypt, JWT sign
- [x] `src/services/product.service.js` — CRUD + low-stock helper
- [x] `src/services/inventory.service.js` — stock-in, stock-out, logs
- [x] `src/services/order.service.js` — purchase with Prisma transaction

## Controllers (thin)

- [x] `src/controllers/auth.controller.js`
- [x] `src/controllers/product.controller.js`
- [x] `src/controllers/inventory.controller.js`
- [x] `src/controllers/order.controller.js`

## Routes

- [x] `POST /login` — auth.routes.js
- [x] `GET /products` — product.routes.js (all roles)
- [x] `POST /products` — MANAGER
- [x] `PUT /products/:id` — MANAGER
- [x] `DELETE /products/:id` — MANAGER
- [x] `POST /inventory/stock-in` — STAFF
- [x] `POST /inventory/stock-out` — STAFF
- [x] `GET /inventory/logs` — MANAGER (view logs)
- [x] `POST /orders` — USER (buy)
- [x] `GET /orders` — USER (own orders)

## Business Rules

- [x] Stock-in: increase stock, log, reset notificationSent if above threshold
- [x] Stock-out: decrease stock (no negative), log
- [x] Purchase: Prisma transaction, 409 if insufficient stock
- [x] Low-stock alert via `console.log`, notificationSent flag

## Not In Scope (by design)

- [ ] RabbitMQ / Redis / Kafka
- [ ] Microservices / Repository Pattern / DI
- [ ] User registration endpoint for USER role only (MANAGER/STAFF still seeded only)

## Pending / Future (optional)

- [ ] Run `npx prisma migrate dev` against a live MySQL instance
- [ ] Integration tests
- [ ] Docker Compose for MySQL

## Frontend (React + Vite)

- [x] Vite + React app in `frontend/`
- [x] JWT login + auth context
- [x] Role-based routes and navigation
- [x] Products list (all roles)
- [x] Manager: product CRUD + inventory logs
- [x] Staff: stock in / stock out
- [x] User: place orders + order history
- [x] Vite dev proxy to backend (`/api` → `:3000`)
- [x] CORS enabled on backend

---

## Demo Credentials (after seed)

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| MANAGER | manager@example.com | password123 |
| STAFF   | staff@example.com   | password123 |
| USER    | user@example.com    | password123 |
