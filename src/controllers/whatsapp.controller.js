const env = require('../config/env');
const whatsappService = require('../services/whatsapp.service');

function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && env.whatsapp.verifyToken && verifyToken === env.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({
    success: false,
    message: 'Invalid verify token',
  });
}

function receiveWebhook(req, res) {
  whatsappService.processWebhookPayload(req.body).catch((error) => {
    console.error('[WhatsApp] Webhook processing failed:', error.message);
  });

  return res.status(200).json({
    success: true,
    message: 'Webhook received',
  });
}

module.exports = {
  verifyWebhook,
  receiveWebhook,
};
