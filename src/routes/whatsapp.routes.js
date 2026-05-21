const express = require('express');

const whatsappController = require('../controllers/whatsapp.controller');

const router = express.Router();

router.get('/', whatsappController.verifyWebhook);
router.post('/', whatsappController.receiveWebhook);

module.exports = router;
