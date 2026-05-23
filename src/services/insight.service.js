const { z } = require('zod');

const env = require('../config/env');
const { getFinancialSummary } = require('./financialSummary.service');
const { createInsightPrompt } = require('../utils/insightPrompt');
const {
  createEmptyInsight,
  createFallbackInsight,
  formatMonthlyInsightResponse,
  normalizeInsight,
} = require('../utils/formatInsight');

const aiInsightSchema = z.object({
  summary: z.string().trim().min(1),
  spendingAnalysis: z.string().trim().min(1),
  topCategoryInsight: z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
  warning: z.string().trim().min(1).nullable(),
  savingTip: z.string().trim().min(1),
  healthScore: z.number().min(0).max(100),
  healthLabel: z.enum(['poor', 'fair', 'good', 'excellent']),
});

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw createHttpError(502, 'Failed to parse AI insight response as JSON', {
      rawResponse: content,
    });
  }
}

async function generateAiInsight(financialSummary) {
  if (!env.openRouter.apiKey || !env.openRouter.model) {
    throw createHttpError(500, 'OpenRouter configuration is missing');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openRouter.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.openRouter.siteUrl,
      'X-OpenRouter-Title': env.openRouter.siteName,
    },
    body: JSON.stringify({
      model: env.openRouter.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: createInsightPrompt(financialSummary),
        },
        {
          role: 'user',
          content: 'Generate monthly financial insight JSON for this period.',
        },
      ],
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createHttpError(response.status, 'OpenRouter insight request failed', result);
  }

  const content = result?.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw createHttpError(502, 'OpenRouter insight response does not contain message content', result);
  }

  const parsed = parseJson(content.trim());
  const validationResult = aiInsightSchema.safeParse(parsed);

  if (!validationResult.success) {
    throw createHttpError(502, 'AI insight response does not match expected schema', {
      issues: validationResult.error.issues,
      rawResponse: parsed,
    });
  }

  return validationResult.data;
}

async function getMonthlyInsight(filters) {
  const financialSummary = await getFinancialSummary(filters);

  if (financialSummary.summary.transactionCount === 0) {
    return formatMonthlyInsightResponse(financialSummary, createEmptyInsight());
  }

  const fallbackInsight = createFallbackInsight(financialSummary.summary);
  let insight = fallbackInsight;

  try {
    const aiInsight = await generateAiInsight(financialSummary);
    insight = normalizeInsight(aiInsight, fallbackInsight);
  } catch (error) {
    console.error('[Insight] OpenRouter failed, using local fallback:', error.message);
  }

  return formatMonthlyInsightResponse(financialSummary, insight);
}

module.exports = {
  getMonthlyInsight,
};
