const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const aiRoutes = require('./routes/ai.routes');
const healthRoutes = require('./routes/health.routes');
const transactionRoutes = require('./routes/transaction.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const budgetRoutes = require('./routes/budget.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/webhook/whatsapp', whatsappRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
  });
});

module.exports = app;
