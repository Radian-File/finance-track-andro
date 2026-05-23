const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL,
    siteUrl: process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
    siteName: process.env.OPENROUTER_SITE_NAME || 'FinTrack',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fintrack_development_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v25.0',
  },
};

module.exports = env;
