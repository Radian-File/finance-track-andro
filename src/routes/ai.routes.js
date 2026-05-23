const express = require('express');

const { parseTransaction } = require('../controllers/ai.controller');
const insightRoutes = require('./insight.routes');

const router = express.Router();

router.post('/parse-transaction', parseTransaction);
router.use('/', insightRoutes);

module.exports = router;
