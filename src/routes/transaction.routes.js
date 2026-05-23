const express = require('express');

const transactionController = require('../controllers/transaction.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(optionalAuth);

router.post('/parse-and-save', transactionController.parseAndSaveTransaction);
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.patch('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
