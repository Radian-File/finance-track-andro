const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`FinTrack backend is running on port ${env.port}`);
});
