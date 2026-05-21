const env = require('../config/env');
const { parseTransactionMessage } = require('./openrouter.service');
const { createTransaction } = require('./transaction.service');
const {
  formatTransactionConfirmation,
  formatTransactionFailure,
  formatUnsupportedMessage,
} = require('../utils/whatsappMessageFormatter');

function extractIncomingMessages(payload) {
  const messages = [];

  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value;
      for (const message of value?.messages || []) {
        messages.push(message);
      }
    }
  }

  return messages;
}

async function sendWhatsAppTextMessage(to, message) {
  const { accessToken, phoneNumberId, apiVersion } = env.whatsapp;

  if (!accessToken) {
    console.error('[WhatsApp] WHATSAPP_ACCESS_TOKEN is missing. Reply was not sent.');
    return { skipped: true, reason: 'missing_access_token' };
  }

  if (!phoneNumberId) {
    console.error('[WhatsApp] WHATSAPP_PHONE_NUMBER_ID is missing. Reply was not sent.');
    return { skipped: true, reason: 'missing_phone_number_id' };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: message,
      },
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[WhatsApp] Failed to send reply:', {
      status: response.status,
      error: result?.error?.message || result,
    });
    return { success: false, status: response.status, error: result };
  }

  return { success: true, data: result };
}

async function processIncomingWhatsAppMessage(message) {
  const sender = message?.from;
  const messageId = message?.id;
  const messageType = message?.type;

  console.log('[WhatsApp] Incoming message:', {
    messageId,
    sender,
    type: messageType,
    text: message?.text?.body,
  });

  if (!sender) {
    console.warn('[WhatsApp] Message ignored because sender is missing.', { messageId });
    return;
  }

  if (messageType !== 'text') {
    await sendWhatsAppTextMessage(sender, formatUnsupportedMessage());
    return;
  }

  const textBody = message?.text?.body?.trim();

  if (!textBody) {
    await sendWhatsAppTextMessage(sender, formatTransactionFailure());
    return;
  }

  try {
    const parsed = await parseTransactionMessage(textBody);
    const transaction = await createTransaction({
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      paymentMethod: parsed.payment_method,
      transactionDate: parsed.transaction_date,
      source: 'whatsapp',
      rawMessage: textBody,
      confidence: parsed.confidence,
    });

    await sendWhatsAppTextMessage(sender, formatTransactionConfirmation(transaction));

    console.log('[WhatsApp] Transaction saved from message:', {
      messageId,
      sender,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('[WhatsApp] Failed to process message:', {
      messageId,
      sender,
      error: error.message,
    });
    await sendWhatsAppTextMessage(sender, formatTransactionFailure());
  }
}

async function processWebhookPayload(payload) {
  const messages = extractIncomingMessages(payload);

  if (messages.length === 0) {
    console.log('[WhatsApp] Webhook payload has no incoming messages. Ignored.');
    return { processed: 0 };
  }

  for (const message of messages) {
    await processIncomingWhatsAppMessage(message);
  }

  return { processed: messages.length };
}

module.exports = {
  extractIncomingMessages,
  sendWhatsAppTextMessage,
  processIncomingWhatsAppMessage,
  processWebhookPayload,
};
