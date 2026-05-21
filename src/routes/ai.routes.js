const express = require('express');

const { parseTransaction } = require('../controllers/ai.controller');

const router = express.Router();

router.post('/parse-transaction', parseTransaction);

module.exports = router;
