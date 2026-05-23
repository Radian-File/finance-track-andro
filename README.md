# FinTrack

**FinTrack** is an AI-powered WhatsApp Personal Finance Tracker that helps users record income and expenses using natural language messages, manual input, and later Android app interactions.

Users can write simple Indonesian transaction messages such as:

```text
tadi beli kopi 18000 pakai dana
gaji masuk 3 juta
kemarin bayar kos 850 ribu
naik gojek 25000 tadi malam
```

FinTrack parses those messages into structured transaction data, stores them in PostgreSQL, and displays the result in a modern Android dashboard.

## Project Progress

**Progress: 65%**

Current status:

- Backend foundation is ready.
- AI transaction parser is working with OpenRouter + DeepSeek.
- PostgreSQL + Prisma schema is implemented.
- Transaction CRUD API is available.
- WhatsApp webhook receive flow is implemented.
- Android basic UI and finance dashboard are implemented locally.
- Budgeting backend API and Android budget screen are implemented.
- AI monthly financial insight backend API and Android Insights screen are implemented.
- Email/password authentication, JWT session, and Android login/register/profile flow are implemented.
- Next major work: notifications, deployment, and final polish.

## Core Features

### Implemented

- Express backend API
- Health check endpoint
- AI transaction parser for Indonesian natural language
- PostgreSQL database schema with Prisma
- Transaction CRUD API
- Parse-and-save transaction endpoint
- WhatsApp Cloud API webhook verification
- WhatsApp incoming message processing
- Android Jetpack Compose basic UI
- Android finance dashboard with local calculations
- Transaction list, add transaction form, and detail screen
- Budgeting CRUD API with usage calculation
- Android budget list, create/update/delete flow, and progress cards
- AI monthly financial insight endpoint with OpenRouter fallback
- Android AI Insights screen with health score, breakdown, recommendation, warning, and saving tip
- Email/password authentication with bcrypt password hashing and JWT
- Android login, register, saved token session, Authorization header, and profile logout

### Planned
- Notification and reminder system
- Deployment to production
- Portfolio-ready documentation, screenshots, and demo video

## Tech Stack

### Backend

- **Node.js**
- **Express.js**
- **dotenv** for environment variables
- **cors** for cross-origin requests
- **morgan** for HTTP logging
- **zod** for validation
- **Prisma** as ORM
- **PostgreSQL** as database

### AI Integration

- **OpenRouter API** for AI model access
- **DeepSeek model** for Indonesian natural language transaction parsing
- Strict JSON output for transaction extraction

Parsed transaction shape:

```json
{
  "type": "expense",
  "amount": 18000,
  "category": "food_drink",
  "description": "beli kopi",
  "payment_method": "dana",
  "transaction_date": "2026-05-21",
  "confidence": 0.9
}
```

### WhatsApp Integration

- **WhatsApp Cloud API**
- Webhook verification endpoint
- Incoming message webhook
- Text message parsing
- Transaction saving from WhatsApp messages
- Confirmation reply support

> Note: During testing, Meta returned error `130497` for outbound messages to Indonesian numbers. For MVP, WhatsApp can run in receive-only mode: receive message, parse, save transaction, and tolerate reply failure.

### Android

- **Kotlin**
- **Jetpack Compose**
- **Material 3**
- **Navigation Compose**
- **Retrofit**
- **OkHttp Logging Interceptor**
- **ViewModel**
- **Coroutines**
- **StateFlow**

### Design

- **Figma** design reference
- Clean Smart Finance style
- Light mode
- Emerald green finance branding
- Deep navy balance card
- Red expense accent
- Green income accent
- Amber insight/warning accent

## Architecture Overview

```mermaid
graph TD
    A[User Message] --> B{Input Source}
    B --> C[WhatsApp Cloud API]
    B --> D[Android App]
    C --> E[Express Backend]
    D --> E
    E --> F[OpenRouter + DeepSeek AI Parser]
    F --> G[Structured Transaction JSON]
    G --> H[Validation Layer]
    H --> I[Prisma ORM]
    I --> J[PostgreSQL Database]
    J --> K[Android Finance Dashboard]
```

## Repository Note

This GitHub repository currently uses the **backend folder as the Git root**, so this README is placed here to represent the full FinTrack project professionally.

Local project layout:

```text
fintrack/
├── backend/      # Express API, Prisma, OpenRouter, WhatsApp webhook
├── android/      # Kotlin Jetpack Compose app
├── docs/         # Roadmap and project docs
├── postman/      # API testing assets
└── README.md     # Local root README
```

Backend module layout:

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
├── .env.example
├── package.json
└── README.md
```

## Backend API Endpoints

### Health

```http
GET /health
```

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

Register example:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Ricky",
  "email": "ricky@example.com",
  "password": "password123"
}
```

Login example:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ricky@example.com",
  "password": "password123"
}
```

Authenticated request example:

```http
GET /api/auth/me
Authorization: Bearer <token>
```

Authenticated transaction create example:

```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "type": "expense",
  "amount": 22000,
  "category": "food_drink",
  "description": "ayam geprek",
  "paymentMethod": "cash",
  "transactionDate": "2026-05-21"
}
```

When a valid token is sent, FinTrack automatically uses the authenticated user's `userId` for transactions, budgets, and monthly insights.

### AI Parser

```http
POST /api/ai/parse-transaction
GET /api/ai/monthly-insight
```

Monthly insight example:

```http
GET /api/ai/monthly-insight?month=5&year=2026
```

Response includes the selected period, calculated financial summary, expense category breakdown, and AI-generated Indonesian insight. If OpenRouter fails, the backend returns a local fallback insight. If there are no transactions, OpenRouter is not called and FinTrack returns a helpful empty insight.

Invalid month example:

```http
GET /api/ai/monthly-insight?month=13&year=2026
```

### Transactions

```http
POST /api/transactions
GET /api/transactions
GET /api/transactions/:id
PATCH /api/transactions/:id
DELETE /api/transactions/:id
POST /api/transactions/parse-and-save
```

### Budgets

```http
POST /api/budgets
GET /api/budgets
GET /api/budgets/:id
PATCH /api/budgets/:id
DELETE /api/budgets/:id
```

Budget usage is calculated from expense transactions in the same category and selected month/year.

Create budget example:

```http
POST /api/budgets
Content-Type: application/json
```

```json
{
  "category": "food_drink",
  "limitAmount": 1000000,
  "month": 5,
  "year": 2026
}
```

Get budget list example:

```http
GET /api/budgets?month=5&year=2026
```

Update budget example:

```http
PATCH /api/budgets/{id}
Content-Type: application/json
```

```json
{
  "limitAmount": 1200000
}
```

Delete budget example:

```http
DELETE /api/budgets/{id}
```

Budget response includes:

```json
{
  "id": "...",
  "category": "food_drink",
  "limitAmount": 1000000,
  "month": 5,
  "year": 2026,
  "usedAmount": 650000,
  "remainingAmount": 350000,
  "usagePercentage": 65,
  "status": "safe"
}
```

Budget status rules:

- `safe`: usage below 80%
- `warning`: usage from 80% to below 100%
- `exceeded`: usage 100% or above

### WhatsApp Webhook

```http
GET /api/webhook/whatsapp
POST /api/webhook/whatsapp
```

## Backend Setup

Install dependencies:

```bash
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Example environment variables:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrack?schema=public"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="your_deepseek_model"
OPENROUTER_SITE_URL="http://localhost:3000"
OPENROUTER_SITE_NAME="FinTrack"
WHATSAPP_VERIFY_TOKEN="fintrack_verify_token_123"
WHATSAPP_ACCESS_TOKEN="your_meta_whatsapp_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_meta_phone_number_id"
WHATSAPP_API_VERSION="v25.0"
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migration:

```bash
npm run prisma:migrate
```

Start development server:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:3000
```

## Android Setup

Open this folder in Android Studio:

```text
fintrack/android
```

Important:

- Use Android Studio for Gradle sync, emulator, build, and debugging.
- Backend must be running before testing API-connected screens.
- Android Emulator uses this backend URL:

```kotlin
http://10.0.2.2:3000/
```

If testing on a physical device, replace the base URL with your computer local network IP.

## Dashboard Features

The Android dashboard currently calculates locally from backend transactions:

- Total income
- Total expense
- Current balance
- Recent transactions
- Monthly transaction count
- Expense by category
- Top spending category
- Local AI insight preview

## Roadmap Summary

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Repository setup | Done |
| Phase 1 | Backend Express setup | Done |
| Phase 2 | OpenRouter AI parser | Done |
| Phase 3 | PostgreSQL + Prisma | Done |
| Phase 4 | Transaction CRUD API | Done |
| Phase 5 | Parse and save transaction | Done |
| Phase 6 | WhatsApp Cloud API webhook | Done |
| Phase 7 | Android basic UI | Done |
| Phase 8 | Android finance dashboard | Done |
| Phase 9 | Budgeting feature | Done |
| Phase 10 | AI financial insight | Done |
| Phase 11 | Authentication | Done |
| Phase 12 | Notification and reminder | Planned |
| Phase 13 | Deployment | Planned |
| Phase 14 | Testing and error handling | Planned |
| Phase 15 | Portfolio finalization | Planned |

## Project Goal

FinTrack is designed as a portfolio-ready full-stack project combining:

- Real-world backend API development
- AI integration
- WhatsApp webhook integration
- PostgreSQL database modeling
- Android app development with Jetpack Compose
- Practical personal finance use case

The final target is to make this project ready for GitHub, CV, LinkedIn, demo video, and technical interviews.
