function createInsightPrompt(financialSummary) {
  const payload = {
    period: financialSummary.period,
    summary: financialSummary.summary,
    categoryBreakdown: financialSummary.summary.expenseByCategory,
  };

  return `You are FinTrack's Indonesian AI financial coach.

Return strict JSON only. Do not include markdown, explanation text, or code blocks.
Write concise and practical Indonesian text for a personal finance app.

Analyze this monthly financial summary:
${JSON.stringify(payload)}

Return this exact JSON shape:
{
  "summary": "Short monthly financial summary in Indonesian.",
  "spendingAnalysis": "Short analysis of spending pattern in Indonesian.",
  "topCategoryInsight": "Short insight about the biggest category in Indonesian.",
  "recommendation": "Practical financial recommendation in Indonesian.",
  "warning": "Warning text if needed, otherwise null.",
  "savingTip": "One practical saving tip in Indonesian.",
  "healthScore": 0,
  "healthLabel": "poor | fair | good | excellent"
}

Health score rules:
- 0-39 = poor
- 40-59 = fair
- 60-79 = good
- 80-100 = excellent
- Use lower score if expenses are higher than income.
- Use warning only when spending is risky, expenses exceed income, or expense growth is high.`;
}

module.exports = {
  createInsightPrompt,
};
