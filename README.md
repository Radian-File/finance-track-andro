# FinTrack Backend

Node.js + Express backend for FinTrack, an AI WhatsApp Personal Finance Tracker.

## Current Features

- Express API server
- `GET /health` health check
- `POST /api/ai/parse-transaction` AI transaction parser using OpenRouter
- PostgreSQL schema setup with Prisma

## Requirements

- Node.js
- npm
- PostgreSQL database
- OpenRouter API key

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Fill `.env` with your local values:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/fintrack?schema=public"
OPENROUTER_API_KEY="your_openrouter_api_key_here"
OPENROUTER_MODEL="your_selected_model_here"
OPENROUTER_SITE_URL="http://localhost:3000"
OPENROUTER_SITE_NAME="FinTrack"
```

## Run Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Default server URL:

```text
http://localhost:3000
```

## Health Check

Request:

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "message": "FinTrack backend is running"
}
```

## AI Transaction Parser

Request:

```http
POST /api/ai/parse-transaction
Content-Type: application/json
```

Body:

```json
{
  "message": "tadi pagi beli kopi 18000 pakai dana"
}
```

Successful response:

```json
{
  "success": true,
  "data": {
    "type": "expense",
    "amount": 18000,
    "category": "food_drink",
    "description": "beli kopi",
    "payment_method": "dana",
    "transaction_date": "YYYY-MM-DD",
    "confidence": 0.9
  }
}
```

### Postman Test Examples

Example 1:

```json
{
  "message": "tadi pagi beli kopi 18000 pakai dana"
}
```

Example 2:

```json
{
  "message": "kemarin bayar kos 850 ribu"
}
```

Example 3:

```json
{
  "message": "gaji masuk 3 juta"
}
```

Example 4:

```json
{
  "message": "naik gojek 25000 tadi malam"
}
```

## Prisma

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migration:

```bash
npm run prisma:migrate
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## Database Models

Initial schema includes:

- `User`
- `Wallet`
- `Transaction`
- `TransactionType` enum
- `TransactionSource` enum

## Common Errors

### `OPENROUTER_API_KEY is missing`

Add a valid OpenRouter API key to `.env`.

### `OPENROUTER_MODEL is missing`

Set a model in `.env`, for example an OpenRouter chat model ID.

### `OpenRouter API request failed`

Check your API key, model name, account credits, and internet connection.

### `AI response does not match the expected transaction schema`

The model returned JSON, but it did not match the required transaction structure. Try a stronger model or re-test the message.

### Prisma cannot connect to database

Check that PostgreSQL is running and `DATABASE_URL` matches your local database credentials.
