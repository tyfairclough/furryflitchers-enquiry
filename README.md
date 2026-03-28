# Furry Flitchers Enquiry App

Mobile-first enquiry wizard (dog/cat/small pet) with:

- Step-by-step “one thing at a time” UX
- MySQL persistence (Prisma)
- Back-office at `/admin` (login + CRUD + enquiry review)
- Suitability screening for dog enquiries (configurable breed rules)
- Notifications: WhatsApp (Twilio) + customer confirmation email (SMTP)
- Quiet anti-bot: honeypot + rate limiting + invisible hCaptcha

## Local setup

### Prerequisites

- Node.js (20+)
- A MySQL/MariaDB database you can connect to

### 1) Install deps

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` → `.env` and fill values.

Critical values:

- `DATABASE_URL`: MySQL connection string
- `SESSION_PASSWORD`: at least 32 characters (used for admin session cookie encryption)

### 3) Create tables

This repo includes an initial migration SQL at `prisma/migrations/0001_init.sql`.

Run it with Prisma (uses `DATABASE_URL` from `prisma.config.ts`):

```bash
npx prisma db execute --file prisma/migrations/0001_init.sql
```

Or run it directly with your MySQL client.

### 4) Seed an admin user

Set env vars:

- `ADMIN_SEED_USERNAME`
- `ADMIN_SEED_PASSWORD`

Then:

```bash
npm run db:seed
```

### 5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Hostinger deployment notes

Hostinger shared hosting often has limited Node.js support. A VPS / Cloud plan with a persistent Node process is strongly recommended.

### App config

Set all environment variables from `.env.example` in Hostinger’s control panel.

### Build & run

Typical commands on the server:

```bash
npm ci
npm run build
npm run start
```

### Database / backups

- Create a dedicated MySQL user for the app with least-privilege access to the app schema.
- Use scheduled backups (e.g. `mysqldump`) and keep off-host copies.

## Back-office

- URL: `/admin`
- Use the seeded admin account to log in.
- Manage:
  - Breed rules (`/admin/breed-rules`)
  - Animal types (`/admin/animal-types`)
  - Settings (`/admin/settings`)
  - Enquiries (`/admin/enquiries`)
