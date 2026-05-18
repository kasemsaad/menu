# Restaurant & Cafe Digital Menu

Full-stack QR menu system for restaurants and cafes: guest ordering, kitchen, waiter, delivery, and admin analytics.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, MUI (icons/emotion), Formik, Yup, i18next (EN/AR), Lucide, Recharts, Leaflet (OpenStreetMap), Socket.IO client, Axios, React Router
- **Backend:** Node.js, Express, MongoDB, Socket.IO, JWT, QR codes

## Features

| Area | Features |
|------|----------|
| **Guest (QR)** | Categories, products, search, cart, addons, notes, offers, ratings, dark/light, EN/AR, call waiter, WhatsApp |
| **Chef** | Realtime orders, status flow, sound alert, table filter, print |
| **Waiter** | Ready orders, table status, bill requests |
| **Delivery** | Accept/track orders, OSM map, WhatsApp chat |
| **Admin** | CRUD (categories, products, tables, users, coupons), QR generator, analytics charts, settings, Paymob placeholder |

## Quick start

1. **MongoDB** running locally (or set `MONGODB_URI` in `server/.env`).

2. Install dependencies:

```bash
cd restaurant-menu
npm run install:all
```

3. Copy env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Seed database:

```bash
npm run seed
```

5. Run dev (API `:8080`, UI `:5173`):

```bash
npm run dev
```

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cafe.com | admin123 |
| Chef | chef@cafe.com | admin123 |
| Waiter | waiter@cafe.com | admin123 |
| Delivery | delivery@cafe.com | admin123 |

## Guest flow

1. Admin → **Tables** → generate QR for a table.
2. Open URL: `http://localhost:5173/menu/{qrCode}`
3. Browse menu → cart → checkout → track order status.

## Paymob

Set `PAYMOB_API_KEY` and `PAYMOB_INTEGRATION_ID` in `server/.env`. Without keys, checkout uses a mock payment redirect.

## Project structure

```
restaurant-menu/
  server/     Express API + Socket.IO
  client/     React Vite app
```
