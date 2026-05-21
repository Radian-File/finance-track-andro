# FinTrack Backend

Node.js + Express backend for FinTrack, an AI WhatsApp Personal Finance Tracker.

## Current Features

- Express API server
- `GET /health` health check
- `POST /api/ai/parse-transaction` AI transaction parser using OpenRouter
- Transaction CRUD API with Prisma + PostgreSQL
- `POST /api/transactions/parse-and-save` AI parse and database save flow

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

On Windows PowerShell:

```powershell
copy .env.example .env
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

This endpoint parses a natural language transaction message but does not save it.

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

## Transaction API

### Create Manual Transaction

```http
POST /api/transactions
Content-Type: application/json
```

Body:

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

Response:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "...",
    "type": "expense",
    "amount": 22000,
    "category": "food_drink",
    "description": "ayam geprek",
    "paymentMethod": "cash",
    "transactionDate": "2026-05-21",
    "source": "manual"
  }
}
```

Optional fields:

- `userId`
- `walletId`
- `paymentMethod`
- `transactionDate`
- `source`
- `rawMessage`
- `confidence`

### Get All Transactions

```http
GET /api/transactions
```

Supported query params:

- `userId`
- `type`: `income` or `expense`
- `category`
- `startDate`: `YYYY-MM-DD`
- `endDate`: `YYYY-MM-DD`
- `source`: `manual`, `ai_parser`, `whatsapp`, or `android`
- `search`
- `page`
- `limit`, max `100`
- `sortBy`: `transactionDate`, `createdAt`, or `amount`
- `sortOrder`: `asc` or `desc`

Examples:

```http
GET /api/transactions?type=expense
GET /api/transactions?category=food_drink
GET /api/transactions?startDate=2026-05-01&endDate=2026-05-31
GET /api/transactions?search=kopi
GET /api/transactions?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "type": "expense",
      "amount": 18000,
      "category": "food_drink",
      "description": "beli kopi",
      "paymentMethod": "dana",
      "transactionDate": "2026-05-21",
      "source": "ai_parser"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Transaction Detail

```http
GET /api/transactions/:id
```

If not found:

```json
{
  "success": false,
  "message": "Transaction not found"
}
```

### Update Transaction

```http
PATCH /api/transactions/:id
Content-Type: application/json
```

Body can contain partial fields:

```json
{
  "amount": 25000,
  "description": "kopi dan roti",
  "paymentMethod": "dana"
}
```

### Delete Transaction

```http
DELETE /api/transactions/:id
```

Response:

```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

## Parse and Save Transaction

This endpoint parses a natural language message with OpenRouter and saves the result to PostgreSQL.

```http
POST /api/transactions/parse-and-save
Content-Type: application/json
```

Body:

```json
{
  "message": "tadi pagi beli kopi 18000 pakai dana"
}
```

Optional body fields:

```json
{
  "message": "tadi pagi beli kopi 18000 pakai dana",
  "userId": "optional-user-id",
  "walletId": "optional-wallet-id"
}
```

Response:

```json
{
  "success": true,
  "message": "Transaction parsed and saved successfully",
  "data": {
    "id": "...",
    "type": "expense",
    "amount": 18000,
    "category": "food_drink",
    "description": "beli kopi",
    "paymentMethod": "dana",
    "transactionDate": "2026-05-21",
    "source": "ai_parser",
    "rawMessage": "tadi pagi beli kopi 18000 pakai dana",
    "confidence": 0.9
  },
  "parsed": {
    "type": "expense",
    "amount": 18000,
    "category": "food_drink",
    "description": "beli kopi",
    "payment_method": "dana",
    "transaction_date": "2026-05-21",
    "confidence": 0.9
  }
}
```

## Postman Examples

Manual create:

```http
POST http://localhost:3000/api/transactions
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

Get all:

```http
GET http://localhost:3000/api/transactions
```

Filter expense:

```http
GET http://localhost:3000/api/transactions?type=expense
```

Search:

```http
GET http://localhost:3000/api/transactions?search=kopi
```

Parse and save:

```http
POST http://localhost:3000/api/transactions/parse-and-save
```

```json
{
  "message": "tadi pagi beli kopi 18000 pakai dana"
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

## Testing Checklist

- [ ] `GET /health` returns backend status.
- [ ] `POST /api/ai/parse-transaction` parses Indonesian natural language.
- [ ] `POST /api/transactions` creates a manual transaction.
- [ ] `GET /api/transactions` returns paginated transaction list.
- [ ] `GET /api/transactions?type=expense` filters by type.
- [ ] `GET /api/transactions?search=kopi` searches description/raw message.
- [ ] `GET /api/transactions/:id` returns transaction detail.
- [ ] `PATCH /api/transactions/:id` updates only provided fields.
- [ ] `DELETE /api/transactions/:id` deletes transaction.
- [ ] `POST /api/transactions/parse-and-save` parses and stores AI transaction.

## Common Errors

### `OPENROUTER_API_KEY is missing`

Add a valid OpenRouter API key to `.env`.

### `OPENROUTER_MODEL is missing`

Set a model in `.env`, for example an OpenRouter chat model ID.

### `OpenRouter API request failed`

Check your API key, model name, account credits, rate limits, and internet connection.

### `AI response does not match the expected transaction schema`

The model returned JSON, but it did not match the required transaction structure. Try a stronger model or re-test the message.

### Prisma cannot connect to database

Check that PostgreSQL is running and `DATABASE_URL` matches your local database credentials.

### `Invalid userId or walletId reference`

The provided `userId` or `walletId` does not exist in the database.

### `Transaction not found`

The transaction ID does not exist or was already deleted.

## WhatsApp Cloud API Webhook

Phase 6 adds WhatsApp webhook verification, message receive, AI parse, transaction save, and reply flow.

### Environment Variables

Add these to `backend/.env`:

```env
WHATSAPP_VERIFY_TOKEN="fintrack_verify_token_123"
WHATSAPP_ACCESS_TOKEN="your_meta_whatsapp_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_meta_phone_number_id"
WHATSAPP_API_VERSION="v25.0"
```

### Local Verification Test

Run backend:

```powershell
npm run dev
```

Open in browser:

```text
http://localhost:3000/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=fintrack_verify_token_123&hub.challenge=123456
```

Expected response must be plain text:

```text
123456
```

### Postman POST Webhook Test

Endpoint:

```http
POST http://localhost:3000/api/webhook/whatsapp
Content-Type: application/json
```

Payload:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "test_waba_id",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551960802",
              "phone_number_id": "test_phone_number_id"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Test User"
                },
                "wa_id": "6281111111111"
              }
            ],
            "messages": [
              {
                "from": "6281111111111",
                "id": "wamid.test123",
                "timestamp": "1710000000",
                "text": {
                  "body": "tadi beli kopi 18000 pakai dana"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

Expected immediate response:

```json
{
  "success": true,
  "message": "Webhook received"
}
```

The backend then processes the message asynchronously:

1. Extracts WhatsApp text message.
2. Parses it with OpenRouter.
3. Saves transaction with `source = "whatsapp"`.
4. Sends confirmation reply to the sender.

### Ngrok + Meta Dashboard Test

Run ngrok:

```powershell
ngrok http 3000
```

Use this callback URL in Meta WhatsApp webhook settings:

```text
https://YOUR_NGROK_URL/api/webhook/whatsapp
```

Verify token:

```text
fintrack_verify_token_123
```

Subscribe to WhatsApp message events, then send a real message to your WhatsApp test number:

```text
tadi beli kopi 18000 pakai dana
```

Expected bot reply:

```text
✅ Transaksi dicatat!

Pengeluaran: Rp18.000
Kategori: food_drink
Deskripsi: beli kopi
Tanggal: 2026-05-21
Metode: dana
```

### WhatsApp Common Errors

#### `Invalid verify token`

The token in URL does not match `WHATSAPP_VERIFY_TOKEN` in `.env`. Restart backend after editing `.env`.

#### Reply is not sent

Check:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- WhatsApp API version
- Meta app permissions
- Recipient test number is registered in Meta test recipients

#### POST webhook returns success but no transaction is saved

Check backend terminal logs. Common causes:

- OpenRouter API key/model issue
- AI parser response invalid
- PostgreSQL not running
- Message type is not `text`

#### Meta keeps retrying webhook

Make sure `POST /api/webhook/whatsapp` returns HTTP 200 quickly. FinTrack processes messages asynchronously after acknowledgement.
