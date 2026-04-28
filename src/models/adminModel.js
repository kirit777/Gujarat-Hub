const { query } = require('../config/db');

const adminModel = {
  findByEmail: (email) => query('SELECT * FROM admins WHERE email=? LIMIT 1', [email]),
  findById: (id) => query('SELECT id,name,email,role FROM admins WHERE id=? LIMIT 1', [id])
};

module.exports = adminModel;
