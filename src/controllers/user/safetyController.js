const { query } = require('../../config/db');

exports.reportUser = async (req, res) => {
  const { reported_user_id, reason } = req.body;
  await query('INSERT INTO reports (reporter_id, reported_user_id, reason) VALUES (?,?,?)', [req.user.id, reported_user_id, reason || null]);
  res.status(201).json({ message: 'User reported' });
};

exports.blockUser = async (req, res) => {
  const { blocked_id } = req.body;
  await query('INSERT IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?,?)', [req.user.id, blocked_id]);
  res.json({ message: 'User blocked' });
};

exports.unblockUser = async (req, res) => {
  await query('DELETE FROM blocks WHERE blocker_id=? AND blocked_id=?', [req.user.id, req.params.id]);
  res.json({ message: 'User unblocked' });
};

exports.blockedUsers = async (req, res) => {
  const rows = await query(
    `SELECT b.*,u.name,u.profile_image FROM blocks b
     JOIN users u ON u.id=b.blocked_id WHERE b.blocker_id=?`,
    [req.user.id]
  );
  res.json(rows);
};
