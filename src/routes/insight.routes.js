const express = require('express');

const insightController = require('../controllers/insight.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/monthly-insight', optionalAuth, insightController.getMonthlyInsight);

module.exports = router;
