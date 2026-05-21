function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatTransactionConfirmation(transaction) {
  const label = transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
  const paymentMethod = transaction.paymentMethod || '-';

  return [
    '✅ Transaksi dicatat!',
    '',
    `${label}: ${formatRupiah(transaction.amount)}`,
    `Kategori: ${transaction.category}`,
    `Deskripsi: ${transaction.description}`,
    `Tanggal: ${transaction.transactionDate}`,
    `Metode: ${paymentMethod}`,
  ].join('\n');
}

function formatTransactionFailure() {
  return [
    'Maaf, transaksi belum berhasil dicatat. Coba tulis dengan format yang lebih jelas, misalnya:',
    '"tadi beli kopi 18000 pakai dana"',
  ].join('\n');
}

function formatUnsupportedMessage() {
  return 'Saat ini FinTrack hanya bisa membaca pesan teks transaksi.';
}

module.exports = {
  formatTransactionConfirmation,
  formatTransactionFailure,
  formatUnsupportedMessage,
};
