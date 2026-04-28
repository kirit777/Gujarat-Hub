const { query } = require('../config/db');

const notificationModel = {
  create: (userId, title, body, type = 'system') => query(
    'INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)',
    [userId, title, body, type]
  ),
  listByUser: (userId, limit, offset) => query(
    'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  )
};

module.exports = notificationModel;
