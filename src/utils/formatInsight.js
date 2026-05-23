function getHealthLabel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function createEmptyInsight() {
  return {
    summary: 'Belum ada transaksi bulan ini.',
    spendingAnalysis: 'FinTrack belum menemukan data pengeluaran untuk dianalisis.',
    topCategoryInsight: 'Kategori terbesar akan muncul setelah kamu mencatat transaksi.',
    recommendation: 'Mulai catat transaksi harian untuk mendapatkan insight keuangan.',
    warning: null,
    savingTip: 'Catat transaksi kecil seperti kopi, transport, dan jajan agar pola pengeluaran lebih terlihat.',
    healthScore: 0,
    healthLabel: 'fair',
  };
}

function createFallbackInsight(summary) {
  const expenseRatio = summary.totalIncome > 0 ? summary.totalExpense / summary.totalIncome : 0;
  const balance = summary.balance;
  const topCategory = summary.topExpenseCategory?.replace(/_/g, ' ') || 'pengeluaran utama';
  let healthScore = 75;

  if (summary.totalIncome === 0 && summary.totalExpense > 0) healthScore = 35;
  else if (balance < 0) healthScore = 30;
  else if (expenseRatio >= 0.8) healthScore = 50;
  else if (expenseRatio >= 0.6) healthScore = 68;
  else if (expenseRatio > 0) healthScore = 82;

  return {
    summary: `Bulan ini pemasukanmu Rp${Math.round(summary.totalIncome).toLocaleString('id-ID')} dan pengeluaranmu Rp${Math.round(summary.totalExpense).toLocaleString('id-ID')}.`,
    spendingAnalysis: summary.totalExpense > 0
      ? `Pengeluaran terbesar berasal dari kategori ${topCategory}.`
      : 'Belum ada pengeluaran yang tercatat bulan ini.',
    topCategoryInsight: summary.topExpenseCategory
      ? `${topCategory} menjadi kategori pengeluaran terbesar bulan ini.`
      : 'Belum ada kategori pengeluaran dominan.',
    recommendation: balance < 0
      ? 'Kurangi pengeluaran tidak wajib dan prioritaskan kebutuhan utama sampai saldo kembali positif.'
      : 'Pertahankan kebiasaan mencatat transaksi dan sisihkan sebagian saldo untuk tabungan.',
    warning: balance < 0 || expenseRatio >= 0.8
      ? 'Pengeluaranmu perlu diperhatikan karena sudah mendekati atau melebihi pemasukan.'
      : null,
    savingTip: 'Tetapkan batas mingguan untuk kategori pengeluaran terbesar agar lebih mudah dikontrol.',
    healthScore,
    healthLabel: getHealthLabel(healthScore),
  };
}

function normalizeInsight(insight, fallbackSummary) {
  const healthScore = Math.max(0, Math.min(100, Number(insight.healthScore ?? fallbackSummary.healthScore ?? 0)));
  const label = ['poor', 'fair', 'good', 'excellent'].includes(insight.healthLabel)
    ? insight.healthLabel
    : getHealthLabel(healthScore);

  return {
    summary: insight.summary || fallbackSummary.summary,
    spendingAnalysis: insight.spendingAnalysis || fallbackSummary.spendingAnalysis,
    topCategoryInsight: insight.topCategoryInsight || fallbackSummary.topCategoryInsight,
    recommendation: insight.recommendation || fallbackSummary.recommendation,
    warning: insight.warning || null,
    savingTip: insight.savingTip || fallbackSummary.savingTip,
    healthScore,
    healthLabel: label,
  };
}

function formatMonthlyInsightResponse(financialSummary, insight) {
  const { period, summary } = financialSummary;

  return {
    period,
    summary: {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      balance: summary.balance,
      transactionCount: summary.transactionCount,
      topExpenseCategory: summary.topExpenseCategory,
      topIncomeCategory: summary.topIncomeCategory,
      averageDailyExpense: summary.averageDailyExpense,
      highestExpenseTransaction: summary.highestExpenseTransaction,
      previousMonthExpense: summary.previousMonthExpense,
      expenseChangePercentage: summary.expenseChangePercentage,
    },
    categoryBreakdown: summary.expenseByCategory,
    insight,
  };
}

module.exports = {
  createEmptyInsight,
  createFallbackInsight,
  formatMonthlyInsightResponse,
  normalizeInsight,
};
