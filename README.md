# GarageBot

AI-powered automotive garage management platform — scheduling, invoicing, customer management, inventory tracking, and vehicle service history.

**Live:** [garagebot.io](https://garagebot.io)

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 7 (Radix UI) |
| Backend | Express + TypeScript |
| Database | PostgreSQL (Drizzle ORM) |
| Payments | Stripe |
| Auth | Trust Layer SSO |
| Deployment | Render (Ohio) |

## Structure

```
garagebot/
├── server/
│   └── routes.ts     # 12,285 lines — API routes
├── client/           # React SPA
├── shared/           # Drizzle schema
└── render.yaml
```

## Development

```bash
npm install
npm run dev
npm run db:push
```
