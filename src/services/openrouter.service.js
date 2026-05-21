const { z } = require('zod');

const env = require('../config/env');
const { TRANSACTION_CATEGORIES, createAIParserPrompt } = require('../utils/aiParserPrompt');

const parsedTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.enum(TRANSACTION_CATEGORIES),
  description: z.string().trim().min(1),
  payment_method: z.string().trim().min(1).nullable(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  confidence: z.number().min(0).max(1),
});

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function getTodayDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function parseAIJson(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw createHttpError(502, 'Failed to parse AI response as JSON', {
      rawResponse: content,
    });
  }
}

async function parseTransactionMessage(message) {
  if (!env.openRouter.apiKey) {
    throw createHttpError(500, 'OPENROUTER_API_KEY is missing');
  }

  if (!env.openRouter.model) {
    throw createHttpError(500, 'OPENROUTER_MODEL is missing');
  }

  const todayDate = getTodayDate();

  let response;

  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openRouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.openRouter.siteUrl,
        'X-OpenRouter-Title': env.openRouter.siteName,
      },
      body: JSON.stringify({
        model: env.openRouter.model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: createAIParserPrompt(todayDate),
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });
  } catch (error) {
    throw createHttpError(502, 'Failed to connect to OpenRouter API', {
      cause: error.message,
    });
  }

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw createHttpError(502, 'OpenRouter returned a non-JSON response');
  }

  if (!response.ok) {
    throw createHttpError(response.status, 'OpenRouter API request failed', result);
  }

  const content = result?.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw createHttpError(502, 'OpenRouter response does not contain message content', result);
  }

  const parsedJson = parseAIJson(content.trim());
  const validationResult = parsedTransactionSchema.safeParse(parsedJson);

  if (!validationResult.success) {
    throw createHttpError(502, 'AI response does not match the expected transaction schema', {
      issues: validationResult.error.issues,
      rawResponse: parsedJson,
    });
  }

  return validationResult.data;
}

module.exports = {
  parseTransactionMessage,
};
