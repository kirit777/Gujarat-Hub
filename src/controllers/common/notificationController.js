const { query } = require('../../config/db');
const { pagination } = require('../../utils/helpers');

exports.listNotifications = async (req, res) => {
  const { page, limit, offset } = pagination(req.query);
  const rows = await query('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT ? OFFSET ?', [req.user.id, limit, offset]);
  res.json({ page, limit, data: rows });
};

exports.markRead = async (req, res) => {
  await query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Notification marked read' });
};

exports.markAllRead = async (req, res) => {
  await query('UPDATE notifications SET is_read=1 WHERE user_id=?', [req.user.id]);
  res.json({ message: 'All notifications marked read' });
};

exports.deleteNotification = async (req, res) => {
  await query('DELETE FROM notifications WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Notification deleted' });
};
