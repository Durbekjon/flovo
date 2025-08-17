Of course. This is the master blueprint. This document is a comprehensive technical and product specification designed to be given to an advanced AI developer or a team. It contains all the context, architecture, features, and design decisions we have made.

AI Instruction: Project Flovo - Full Application Build Specification

Objective: Build a complete, production-ready, multi-tenant SaaS application named "Flovo."

1. High-Level Project Overview

Project Name: Flovo

Core Mission: To create an AI-powered Telegram sales assistant for small and medium businesses in Uzbekistan. The application will automate customer service, manage orders, and provide sales analytics, all through a friendly and professional AI persona named "Flovo."

Brand Persona: Flovo is a young, tech-savvy, and highly capable AI saleswoman. The entire application's UI/UX and conversational tone should reflect her personality: helpful, professional, warm, and intelligent.

2. Architectural Blueprint

The application will be built using a decoupled, two-service architecture.

Backend Service (flovo-backend): A NestJS API that serves as the central brain. It handles all business logic, database interactions, AI communication, and Telegram webhook processing.

Frontend Service (flovo-frontend): A Next.js web application that serves as the client-facing dashboard for sellers to manage their accounts, view orders, and configure their bot.

Communication: The frontend and backend will communicate via a RESTful API. Authentication will be managed using JWTs issued by the backend.

3. Technology Stack (Non-negotiable)

Frontend:

Framework: Next.js (with App Router)

UI Library: Mantine UI

State Management: React Hooks (useState, useContext)

Data Fetching: Axios or native Fetch API

Backend:

Framework: NestJS

Database ORM: Prisma

Database: PostgreSQL

Authentication: JWT (managed by @nestjs/jwt)

External Services:

AI Model: Google Gemini 2.5 Flash API

Telegram API: For both the Bot API and the Login Widget

Development: ngrok for local webhook testing.

4. Database Schema (Prisma)

This is the single source of truth for our data structure. Implement this schema exactly.

code
Prisma
download
content_copy
expand_less

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               Int      @id @default(autoincrement())
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  telegramId       BigInt   @unique
  telegramUsername String?
  firstName        String?
  lastName         String?
  companyName      String?
  companyType      CompanyType?
  bot              Bot?
  orders           Order[]
  @@map("users")
}

model Bot {
  id            Int      @id @default(autoincrement())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  token         String   @unique
  isEnabled     Boolean  @default(true)
  userId        Int      @unique
  user          User     @relation(fields: [userId], references: [id])
  conversations Conversation[]
  @@map("bots")
}

model Conversation {
  id        String   @id @unique
  createdAt DateTime @default(now())
  botId     Int
  bot       Bot      @relation(fields: [botId], references: [id])
  messages  Message[]
  @@map("conversations")
}

model Message {
  id             String       @id @default(cuid())
  createdAt      DateTime     @default(now())
  sender         SenderType
  content        String
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  @@map("messages")
}

model Order {
  id              Int        @id @default(autoincrement())
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  status          OrderStatus @default(PENDING)
  customerName    String?
  customerContact String?
  customerAddress String?
  details         Json
  userId          Int
  user            User       @relation(fields: [userId], references: [id])
  @@map("orders")
}

enum CompanyType { CLOTHING, FOOD, FURNITURE, ELECTRONICS, COSMETICS, TOYS, BOOKS, SPORTS, HEALTH, OTHER }
enum SenderType { USER, BOT }
enum OrderStatus { PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED }
5. Backend API Specification (flovo-backend)

Implement the following modules and logic in NestJS.

AuthModule:

Endpoint: POST /auth/telegram/login

Logic:

Receives user data from the frontend (from the Telegram Login Widget).

Performs a critical security check by validating the received hash against a locally computed HMAC-SHA-256 hash using the TELEGRAM_BOT_TOKEN as the secret key.

If valid, finds a User in the database by telegramId. If not found, creates a new User.

Generates a JWT containing the userId and returns it to the frontend.

UserModule:

Endpoint: POST /users/bot (Protected)

Logic: Connects a Telegram bot token submitted by a logged-in user to their User account. The token must be encrypted before being saved in the Bot table.

OrderModule:

Endpoint: GET /orders (Protected)

Logic: Fetches and returns all orders belonging to the authenticated user.

TelegramModule (The Core Engine):

Endpoint: POST /telegram/webhook

Logic (The Conversational Memory Flow): This is the most critical logic. For every incoming message:

Receive & Identify: Receive the webhook data. Identify the corresponding Bot (and therefore the User) via the bot token present in the request.

Save User Message: Immediately save the incoming user message to the Message table, linked to the correct Conversation.

Retrieve History: Query the database to get the last 10-15 messages for that Conversation.

Construct Prompt: Build a detailed prompt for the Gemini API. This prompt MUST include:

Flovo's core persona and instructions.

The retrieved conversation history.

The new user message.

Instructions to identify intents (e.g., "is this an order?").

Call AI: Send the complete prompt to the Gemini 2.5 Flash API.

Parse & Act: Receive the response from Gemini.

Parse the response to see if a specific intent was triggered (e.g., intent: CREATE_ORDER).

If an intent is found, call the appropriate service (e.g., OrderService.createOrder(data)).

Save Bot Message: Save Gemini's final text response to the Message table as a message from the BOT.

Reply to User: Send the text response back to the user via the Telegram Bot API.

6. Frontend UI/UX Specification (flovo-frontend)

Implement the following pages and components using Next.js and Mantine UI, following the specified design system.

Design System:

Colors: Primary Blue (#4C6EF5), Accent Glow (#FABD7F), Charcoal Text (#212529), Soft Grey BG (#F8F9FA).

Font: Inter.

Core Principle: The Flovo character illustration is a key UI element used to build trust and add personality, especially on landing, login, and empty state pages.

Pages:

Landing Page (/):

Components: Navigation, HeroSection (with Flovo illustration), ProblemSection, MissedSalesCalculator, FeaturesGrid, TestimonialSection, PricingSection, FinalCTASection, Footer.

Functionality: The MissedSalesCalculator must be fully interactive, with sliders updating a real-time calculation based on the formula: (chats * saleValue * (conversion/100)) * 30.

Login Page (/login):

UI: A minimalist, centered card with the Flovo headshot, a welcome message, and the Telegram Login Widget.

Functionality: Must use the official telegram-widget.js script. The onauth callback will trigger an API call to the backend's /auth/telegram/login endpoint. It must handle loading and error states gracefully.

Onboarding Flow (/onboarding - for first-time users):

UI: A 2-step wizard.

Step 1: Welcome screen featuring Flovo.

Step 2: A form to submit the user's bot token, with clear instructions on how to get it. Must include a celebratory success animation/message upon successful connection.

Dashboard (/dashboard):

UI: A main layout using Mantine's AppShell (sidebar + header). The main page should show key stats in cards and a sales chart. It must include the "Flovo's Tip" component.

Functionality: Fetches summary data from a future /dashboard/summary backend endpoint.

Orders Page (/dashboard/orders):

UI: A clean page with a Mantine DataTable. Must be responsive for mobile (horizontal scroll). It must feature the "Empty State" design with the Flovo illustration if no orders exist.

Functionality: Fetches and displays data from the backend's /orders endpoint.

7. MVP Scope (Initial Build Focus)

The goal is a functional end-to-end loop. The following features constitute the MVP:

Backend: All modules specified, but logic can be simplified. The AI prompt should focus on greeting and order collection.

Frontend: The Login Page, Onboarding Flow, and the Orders Page are essential. The main Dashboard page can be a simple placeholder.

NOT in MVP: Autoposting, advanced analytics, detailed settings, the full landing page (a simple "coming soon" page is sufficient initially). The focus is on the core product loop.

## Implementation Plan and Sprints

### Assumptions

- **Team**: 2–3 engineers (1 full‑stack, 1 backend, 1 frontend), 1 designer (part‑time)
- **Cadence**: Weekly sprints; MVP target 6–8 weeks
- **Environments**: Local (Docker), staging, production
- **Infra targets**: PostgreSQL (managed), Vercel (frontend), Fly.io/Render/Heroku (backend), Railway/Neon for Postgres, optional S3‑compatible storage later
- **Secrets**: Environment variables; no secrets in code
- **Stack**: Next.js (App Router) + Mantine; NestJS + Prisma + PostgreSQL; Axios/Fetch; Google Gemini 2.5 Flash; Telegram Bot API/Login Widget; ngrok for webhooks

### High‑Level Milestones

- **M0**: Project foundations, CI/CD, DB baseline, skeleton apps
- **M1**: Auth (Telegram Login) + JWT
- **M2**: Bot connect + encryption + onboarding
- **M3**: Telegram webhook + conversation memory + minimal AI
- **M4**: Orders API + Orders UI
- **M5**: Hardening (security, observability), staging, MVP‑ready
- **M6**: Production go‑live

### Sprint 0 (Week 0): Foundations and Environments

- **Goals**: Repo scaffolding, CI/CD, DB, local dev workflow
- **Scope**:
  - Repos: `flovo-backend` (NestJS), `flovo-frontend` (Next.js App Router) in mono or split repos
  - Add Prisma schema (as specified) and run initial migration
  - Docker Compose for Postgres; manage `DATABASE_URL`
  - CI: build, lint, tests (GitHub Actions) with preview deploys
  - Backend: module skeletons (`Auth`, `Users`, `Orders`, `Telegram`), `/healthz`
  - Frontend: Mantine theme, Inter font, AppShell scaffold; placeholder pages `/`, `/login`, `/onboarding`, `/dashboard`, `/dashboard/orders`
  - `.env.example` for both apps
- **Deliverables**: Apps bootstrapped, CI green, DB migrated; health and pages render locally
- **Acceptance**: Local dev runs (`dev` scripts), `prisma migrate dev` succeeds, CI lint/tests pass on PRs

### Sprint 1 (Week 1): Auth (Telegram Login) + JWT

- **Backend**:
  - `POST /auth/telegram/login`: validate Telegram hash via HMAC‑SHA256 with `TELEGRAM_BOT_TOKEN`
  - `findOrCreate(User)` by `telegramId`; issue JWT (`userId`)
  - Implement `JwtAuthGuard` and `CurrentUser` decorator
- **Frontend**:
  - `/login`: integrate official Telegram Login Widget; `onauth` → call backend
  - Persist token (httpOnly cookie or secure storage); redirect onboarding vs dashboard
  - Graceful loading/error states
- **Deliverables**: End‑to‑end login functional
- **Acceptance**: Valid payload yields JWT and 200; invalid hash → 401; protected test endpoint accessible with JWT

### Sprint 2 (Week 2): Bot Connect + Encryption + Onboarding

- **Backend**:
  - `POST /users/bot` (Protected): store encrypted bot token in `Bot.token`
  - Encryption: AES‑256‑GCM with random IV; store `iv:ciphertext:authTag`; 32‑byte `ENCRYPTION_KEY`
- **Frontend**:
  - `/onboarding`: 2‑step wizard (Welcome → Bot token form)
  - Success animation/message upon connection
- **Deliverables**: Secure token storage; complete onboarding flow
- **Acceptance**: No plaintext tokens in DB; decrypt unit‑tested; creating/connecting bot succeeds and UI confirms

### Sprint 3 (Week 3): Telegram Webhook + Conversation Memory + Minimal AI

- **Backend**:
  - `POST /telegram/webhook`:
    - Identify Bot via token/webhook association; map to User
    - Ensure `Conversation` by chat id; save incoming `Message` (sender=USER)
    - Retrieve last 10–15 messages; build prompt with persona + history + new message + simple intent guidance
    - Call Gemini 2.5 Flash; parse response; detect basic `CREATE_ORDER` intent
    - If intent: `OrderService.createOrder(data)` (stub acceptable in MVP)
    - Save BOT `Message`; reply via Telegram Bot API
  - Idempotency for duplicate updates (track `update_id` short‑TTL)
  - Rate limiting, logging, error handling
- **Deliverables**: End‑to‑end conversational loop
- **Acceptance**: Telegram message → bot reply; messages persisted; history truncation works; AI timeouts handled without crashes

### Sprint 4 (Week 4): Orders API + Orders UI (MVP Core)

- **Backend**:
  - `GET /orders` (Protected): scoped by `userId`, with pagination/sorting
  - Wire `OrderService.createOrder` from webhook intent
- **Frontend**:
  - `/dashboard/orders`: Mantine DataTable, responsive, empty state with Flovo illustration
  - Loading/error states; simple filters; fetch from `/orders`
- **Deliverables**: Orders visible in UI after chat creation
- **Acceptance**: Orders appear within 2s of refetch; empty state renders correctly

### Sprint 5 (Week 5): Dashboard Placeholder + Tips + Summary API

- **Backend**: `GET /dashboard/summary` with aggregates (counts by status, last 7‑day totals)
- **Frontend**: `/dashboard` with KPI cards, lightweight chart, “Flovo’s Tip”
- **Deliverables**: Dashboard renders live summary
- **Acceptance**: Aggregates correct; chart loads without errors

### Sprint 6 (Week 6): Hardening, Security, Observability, Staging

- **Security**: JWT expirations/refresh strategy, input validation (`class-validator`), throttling, Helmet/CORS, least‑privileged DB user
- **Observability**: Structured logging, request IDs, Sentry, basic metrics
- **Reliability**: Retry Telegram send failures with backoff
- **Deliverables**: Security checklist passed; stable staging
- **Acceptance**: OWASP basics satisfied; no secrets in logs; p95 latency < 500ms for simple APIs in staging

### Sprint 7 (Week 7): E2E Tests, Docs, DX Polish

- **Tests**:
  - Backend unit tests (auth hash verify, crypto, intent parsing) and integration tests (Prisma, APIs)
  - Frontend unit tests (Login, Onboarding, Orders) and a few Playwright E2E flows
- **Docs**: READMEs (setup, envs, deployment), Swagger at `/docs`
- **DX**: Prettier/ESLint/TS configs unified; Husky pre‑commit hooks
- **Deliverables**: Test suite in CI; complete docs
- **Acceptance**: >80% coverage on critical modules; green CI on main; new dev onboards in < 30 minutes

### Sprint 8 (Week 8): Production Launch

- **Infra**: Backend deploy (Fly.io/Render/Heroku), Frontend on Vercel, managed Postgres (Railway/Neon); staging/production DBs
- **Ops**: Set Telegram webhook to prod URL; rotate tokens/keys; audit envs; rollback plan
- **Deliverables**: Production deployment; smoke tests
- **Acceptance**: Real Telegram chat → order created → visible in dashboard; logs/metrics clean

### Cross‑Cutting Implementation Details

- **Data model**: Use provided Prisma schema; add indexes on `Message.conversationId`, `Order.userId`, `Conversation.botId`
- **Encryption**: AES‑256‑GCM with per‑token random IV; store `iv:ciphertext:authTag`
- **Error handling**: Central Nest exception filters; meaningful 4xx/5xx mapping; hide stack traces in prod
- **Rate limiting**: Webhook/auth endpoints throttled; exponential backoff on Gemini/Telegram calls
- **Idempotency**: Track processed Telegram `update_id`s per bot for short TTL
- **Prompting**: Constrained, deterministic prompt; simple mini‑schema for intents; robust fallback parsing
- **Multi‑tenancy**: Scope queries by `userId`/`botId` derived from JWT or bot token

### Testing Strategy

- **Unit**: Auth hash verification, encryption/decryption, intent parse
- **Integration**: Prisma with test DB; API via Supertest
- **E2E**: Playwright for login → onboarding → Telegram message → order appears
- **Load**: Light k6/Artillery on `/orders` and webhook

### CI/CD

- **Pipelines**: Lint, build, tests on PRs; blocking checks
- **Preview envs**: Auto DB migrations for preview (ephemeral DB)
- **Releases**: Tag‑based deploy to production with manual approval; Sentry release annotations; git SHA in `/healthz`

### Risks and Mitigations

- **Telegram hash validation pitfalls**: Exhaustive unit tests; local payload simulation
- **AI variability**: Constrain prompt; require explicit intent markers; guardrails/fallbacks
- **Webhook reliability**: Retries, idempotency, dead‑letter logging
- **Secrets management**: Platform secrets; rotation procedure pre‑launch

### Post‑MVP Roadmap (Selected)

- Rich intent taxonomy (returns, FAQs, inventory)
- Seller settings (hours, delivery pricing, catalog)
- Advanced analytics and dashboards
- Role‑based access, teams, multiple bots per user (if needed)
- Message viewer in dashboard with transcripts

### Minimal Directory Structure (Suggested)

- **Backend `flovo-backend`**:
  - `src/modules/{auth,users,orders,telegram}/...`
  - `src/common/{guards,decorators,filters}`
  - `prisma/schema.prisma`
- **Frontend `flovo-frontend`**:
  - `app/{login,onboarding,dashboard,dashboard/orders}/page.tsx`
  - `components/{layout,charts,tables,illustrations}`

### Key Acceptance Criteria Summary (MVP)

- Valid Telegram login yields JWT; protected APIs work
- User submits bot token; token stored encrypted
- Webhook processes messages, persists conversation, replies
- Basic AI loop can trigger order creation
- `/orders` returns user‑scoped orders; Orders page displays them
- Dashboard shows basic summary; app secured, observable, deployed to staging