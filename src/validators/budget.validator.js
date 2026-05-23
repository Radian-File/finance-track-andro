const { z } = require('zod');

function getCurrentMonthYear() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date());

  return {
    month: Number(parts.find((part) => part.type === 'month')?.value),
    year: Number(parts.find((part) => part.type === 'year')?.value),
  };
}

const currentMonthYear = getCurrentMonthYear();

const optionalIdSchema = z.string().trim().min(1).optional();
const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(1970).max(9999);

const createBudgetSchema = z.object({
  userId: optionalIdSchema,
  category: z.string().trim().min(1, 'category is required'),
  limitAmount: z.coerce.number().positive('limitAmount must be a positive number'),
  month: monthSchema,
  year: yearSchema,
});

const updateBudgetSchema = z.object({
  userId: z.string().trim().min(1).nullable().optional(),
  category: z.string().trim().min(1, 'category cannot be empty').optional(),
  limitAmount: z.coerce.number().positive('limitAmount must be a positive number').optional(),
  month: monthSchema.optional(),
  year: yearSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'at least one field is required',
});

const budgetQuerySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  month: monthSchema.default(currentMonthYear.month),
  year: yearSchema.default(currentMonthYear.year),
});

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
};
