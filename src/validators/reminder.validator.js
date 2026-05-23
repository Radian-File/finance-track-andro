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

const reminderQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).default(currentMonthYear.month),
  year: z.coerce.number().int().min(1970).max(9999).default(currentMonthYear.year),
});

module.exports = {
  reminderQuerySchema,
};
