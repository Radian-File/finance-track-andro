const { z } = require('zod');

const transactionTypeSchema = z.enum(['income', 'expense']);
const transactionSourceSchema = z.enum(['manual', 'ai_parser', 'whatsapp', 'android']);

const dateStringSchema = z.string().trim().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'date must be a valid YYYY-MM-DD string');

const optionalIdSchema = z.string().trim().min(1).optional();

const createTransactionSchema = z.object({
  userId: optionalIdSchema,
  walletId: optionalIdSchema,
  type: transactionTypeSchema,
  amount: z.coerce.number().positive('amount must be a positive number'),
  category: z.string().trim().min(1, 'category is required'),
  description: z.string().trim().min(1, 'description is required'),
  paymentMethod: z.string().trim().min(1).nullable().optional(),
  transactionDate: dateStringSchema.optional(),
  source: transactionSourceSchema.default('manual').optional(),
  rawMessage: z.string().trim().min(1).optional(),
  confidence: z.coerce.number().min(0).max(1).optional(),
});

const updateTransactionSchema = z.object({
  userId: optionalIdSchema.nullable().optional(),
  walletId: optionalIdSchema.nullable().optional(),
  type: transactionTypeSchema.optional(),
  amount: z.coerce.number().positive('amount must be a positive number').optional(),
  category: z.string().trim().min(1, 'category cannot be empty').optional(),
  description: z.string().trim().min(1, 'description cannot be empty').optional(),
  paymentMethod: z.string().trim().min(1).nullable().optional(),
  transactionDate: dateStringSchema.optional(),
  source: transactionSourceSchema.optional(),
  rawMessage: z.string().trim().min(1).nullable().optional(),
  confidence: z.coerce.number().min(0).max(1).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'at least one field is required',
});

const transactionQuerySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  type: transactionTypeSchema.optional(),
  category: z.string().trim().min(1).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  source: transactionSourceSchema.optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['transactionDate', 'createdAt', 'amount']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return data.startDate <= data.endDate;
}, {
  message: 'startDate must be before or equal to endDate',
  path: ['startDate'],
});

const parseAndSaveTransactionSchema = z.object({
  message: z.string().trim().min(1, 'message cannot be empty'),
  userId: optionalIdSchema,
  walletId: optionalIdSchema,
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  parseAndSaveTransactionSchema,
};
