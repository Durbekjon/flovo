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

AI Model: Google Gemini 1.5 Flash API

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

Call AI: Send the complete prompt to the Gemini 1.5 Flash API.

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