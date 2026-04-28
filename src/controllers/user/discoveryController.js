const { query } = require('../../config/db');
const { pagination } = require('../../utils/helpers');

exports.recommendedUsers = async (req, res) => {
  const { limit, offset, page } = pagination(req.query);
  const rows = await query(
    `SELECT id,name,age,gender,bio,city,state,country,profile_image FROM users
     WHERE id != ? AND is_active=1
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [req.user.id, limit, offset]
  );
  res.json({ page, limit, data: rows });
};

exports.nearbyUsers = async (req, res) => {
  const { latitude, longitude } = req.query;
  const { limit, offset, page } = pagination(req.query);
  const rows = await query(
    `SELECT id,name,age,gender,bio,city,state,country,profile_image,
      (6371 * ACOS(COS(RADIANS(?))*COS(RADIANS(latitude))*COS(RADIANS(longitude)-RADIANS(?))+SIN(RADIANS(?))*SIN(RADIANS(latitude)))) AS distance
     FROM users WHERE id != ? AND latitude IS NOT NULL AND longitude IS NOT NULL
     ORDER BY distance ASC LIMIT ? OFFSET ?`,
    [latitude, longitude, latitude, req.user.id, limit, offset]
  );
  res.json({ page, limit, data: rows });
};

exports.searchUsers = async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const rows = await query(
    'SELECT id,name,age,gender,city,country,profile_image FROM users WHERE id!=? AND (name LIKE ? OR city LIKE ? OR country LIKE ?) LIMIT 100',
    [req.user.id, q, q, q]
  );
  res.json(rows);
};

exports.filterUsers = async (req, res) => {
  const minAge = Number(req.query.minAge || 18);
  const maxAge = Number(req.query.maxAge || 99);
  const gender = req.query.gender || '%';
  const rows = await query(
    `SELECT id,name,age,gender,bio,city,country,profile_image FROM users
     WHERE id!=? AND age BETWEEN ? AND ? AND gender LIKE ? LIMIT 100`,
    [req.user.id, minAge, maxAge, gender]
  );
  res.json(rows);
};
