# Inventory Management System

A simple backend for managing products, inventory, and orders. Built with **Express.js**, **Prisma**, **MySQL**, **JWT**, and **bcrypt**.

> **Session continuity:** See [`PROGRESS.md`](./PROGRESS.md) for an implementation checklist agents can read after a session reset.

## Tech Stack

- Node.js + Express.js
- Prisma ORM + MySQL
- JWT authentication + bcrypt password hashing

## Project Structure

```
src/
  server.js          # Entry point
  app.js             # Express app setup
  routes/            # Route definitions
  controllers/       # Thin HTTP handlers
  services/          # Business logic
  middleware/        # JWT auth + role checks
  prisma/client.js   # Prisma client singleton
prisma/
  schema.prisma      # Database models
  seed.js            # Demo users & sample product
```

## Setup

All commands below run from the `backend/` directory:

```bash
cd backend
```

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials and a JWT secret.

### 3. Create the database

Create a MySQL database (e.g. `inventory_db`) before running migrations.

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Seed demo data (optional)

```bash
npm run seed
```

### 6. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:3000`.

## Demo Users (after seed)

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| MANAGER | manager@example.com | password123 |
| STAFF   | staff@example.com   | password123 |
| USER    | user@example.com    | password123 |

## Authentication

All protected routes require a JWT in the header:

```
Authorization: Bearer <token>
```

Get a token via `POST /login`.

Regular users can create a new account using `POST /register`. MANAGER and STAFF users must be created via seed or backend setup and cannot self-register.

## API Endpoints

| Method | Endpoint               | Role    | Description              |
|--------|------------------------|---------|--------------------------|
| POST   | `/login`               | Public  | Login, returns JWT       |
| POST   | `/register`            | Public  | Create USER account      |
| GET    | `/products`            | All     | List products            |
| POST   | `/products`            | MANAGER | Create product           |
| PUT    | `/products/:id`        | MANAGER | Update product           |
| DELETE | `/products/:id`        | MANAGER | Delete product           |
| POST   | `/inventory/stock-in`  | STAFF   | Add stock                |
| POST   | `/inventory/stock-out` | STAFF   | Remove stock             |
| GET    | `/inventory/logs`      | MANAGER | View inventory logs      |
| POST   | `/orders`              | USER    | Purchase products        |
| GET    | `/orders`              | USER    | View own orders          |

## Example Requests

### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}'
```

### Create Product (Manager)

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Laptop","category":"Electronics","price":999.99,"stock":10,"lowStockThreshold":5}'
```

### Stock In (Staff)

```bash
curl -X POST http://localhost:3000/inventory/stock-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"productId":1,"quantity":20}'
```

### Place Order (User)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":1,"quantity":2}]}'
```

### Insufficient Stock Response (409)

```json
{
  "message": "Insufficient stock"
}
```

## Low Stock Notifications

After every stock update, if `stock <= lowStockThreshold` and `notificationSent` is `false`, the server logs:

```
LOW STOCK ALERT : Product Laptop has only 3 items left
```

When stock goes above the threshold, `notificationSent` resets to `false`.

## Role Permissions

| Action          | MANAGER | STAFF | USER |
|-----------------|---------|-------|------|
| CRUD products   | Yes     | No    | No   |
| View logs       | Yes     | No    | No   |
| Stock in/out    | No      | Yes   | No   |
| View products   | Yes     | Yes   | Yes  |
| Buy / orders    | No      | No    | Yes  |

## License

MIT
