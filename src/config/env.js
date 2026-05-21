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
};

module.exports = env;
