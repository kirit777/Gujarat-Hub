const { getMessaging } = require('../config/firebase');

async function sendPushToToken(token, notification = {}, data = {}) {
  const messaging = getMessaging();
  if (!messaging || !token) return { skipped: true };

  return messaging.send({
    token,
    notification,
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
  });
}

module.exports = { sendPushToToken };
