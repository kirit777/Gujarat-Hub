const { query } = require('../config/db');

const paymentModel = {
  create: (userId, amount, paymentId, status = 'success') => query(
    'INSERT INTO payments (user_id, amount, payment_id, status) VALUES (?,?,?,?)',
    [userId, amount, paymentId, status]
  ),
  historyByUser: (userId) => query('SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC', [userId])
};

module.exports = paymentModel;
