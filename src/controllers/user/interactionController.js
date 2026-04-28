const { query } = require('../../config/db');

async function createLike(req, res, status) {
  const { to_user_id } = req.body;
  if (!to_user_id) return res.status(400).json({ message: 'to_user_id required' });

  await query(
    `INSERT INTO likes (from_user_id,to_user_id,status)
     VALUES (?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status)`,
    [req.user.id, to_user_id, status]
  );

  if (status !== 'dislike') {
    const reverse = await query('SELECT id FROM likes WHERE from_user_id=? AND to_user_id=? AND status IN ("like","super_like")', [to_user_id, req.user.id]);
    if (reverse.length) {
      await query('INSERT IGNORE INTO matches (user1_id,user2_id) VALUES (LEAST(?,?), GREATEST(?,?))', [req.user.id, to_user_id, req.user.id, to_user_id]);
      return res.json({ message: `${status} saved and matched!` });
    }
  }

  return res.json({ message: `${status} saved` });
}

exports.like = (req, res) => createLike(req, res, 'like');
exports.dislike = (req, res) => createLike(req, res, 'dislike');
exports.superLike = (req, res) => createLike(req, res, 'super_like');

exports.likesReceived = async (req, res) => {
  const rows = await query(
    `SELECT l.*,u.name,u.profile_image FROM likes l
     JOIN users u ON u.id=l.from_user_id
     WHERE l.to_user_id=? ORDER BY l.id DESC`,
    [req.user.id]
  );
  res.json(rows);
};

exports.likesSent = async (req, res) => {
  const rows = await query(
    `SELECT l.*,u.name,u.profile_image FROM likes l
     JOIN users u ON u.id=l.to_user_id
     WHERE l.from_user_id=? ORDER BY l.id DESC`,
    [req.user.id]
  );
  res.json(rows);
};

exports.matches = async (req, res) => {
  const rows = await query(
    `SELECT m.*,u.id as user_id,u.name,u.profile_image
     FROM matches m
     JOIN users u ON u.id = IF(m.user1_id=?, m.user2_id, m.user1_id)
     WHERE m.user1_id=? OR m.user2_id=? ORDER BY m.id DESC`,
    [req.user.id, req.user.id, req.user.id]
  );
  res.json(rows);
};

exports.unmatch = async (req, res) => {
  await query('DELETE FROM matches WHERE id=? AND (user1_id=? OR user2_id=?)', [req.params.id, req.user.id, req.user.id]);
  res.json({ message: 'Unmatched successfully' });
};
