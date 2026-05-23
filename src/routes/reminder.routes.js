const express = require('express');

const reminderController = require('../controllers/reminder.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/summary', requireAuth, reminderController.getReminderSummary);

module.exports = router;
