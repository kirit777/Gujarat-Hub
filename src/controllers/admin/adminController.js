const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const generateToken = require('../../utils/generateToken');
const { sendPushToToken } = require('../../services/pushService');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [admin] = await query('SELECT * FROM admins WHERE email=? LIMIT 1', [email]);
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken({ id: admin.id, email: admin.email, role: admin.role, type: 'admin' });
  res.json({ token });
};

exports.me = async (req, res) => {
  const [admin] = await query('SELECT id,name,email,role FROM admins WHERE id=?', [req.user.id]);
  res.json(admin || null);
};

exports.dashboard = async (_, res) => {
  const [[users]] = [await query('SELECT COUNT(*) as totalUsers FROM users')];
  const [[matches]] = [await query('SELECT COUNT(*) as totalMatches FROM matches')];
  const [[payments]] = [await query('SELECT COUNT(*) as totalPayments FROM payments')];
  res.json({ ...users, ...matches, ...payments });
};

exports.stats = async (_, res) => {
  const data = await query(
    `SELECT
      (SELECT COUNT(*) FROM users WHERE is_active=1) activeUsers,
      (SELECT COUNT(*) FROM reports) totalReports,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='success') revenue`
  );
  res.json(data[0]);
};

exports.users = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const offset = (page - 1) * limit;
  const rows = await query('SELECT id,name,email,is_active,is_verified,created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
  res.json({ page, limit, data: rows });
};

exports.userById = async (req, res) => {
  const [row] = await query('SELECT * FROM users WHERE id=?', [req.params.id]);
  res.json(row || null);
};

exports.blockUser = async (req, res) => { await query('UPDATE users SET is_active=0 WHERE id=?', [req.params.id]); res.json({ message: 'User blocked' }); };
exports.unblockUser = async (req, res) => { await query('UPDATE users SET is_active=1 WHERE id=?', [req.params.id]); res.json({ message: 'User unblocked' }); };
exports.deleteUser = async (req, res) => { await query('DELETE FROM users WHERE id=?', [req.params.id]); res.json({ message: 'User deleted' }); };
exports.verifyUser = async (req, res) => { await query('UPDATE users SET is_verified=1 WHERE id=?', [req.params.id]); res.json({ message: 'User verified' }); };

exports.reports = async (_, res) => {
  const rows = await query('SELECT r.*, u1.name as reporter_name, u2.name as reported_name FROM reports r JOIN users u1 ON u1.id=r.reporter_id JOIN users u2 ON u2.id=r.reported_user_id ORDER BY r.id DESC');
  res.json(rows);
};
exports.deleteReport = async (req, res) => { await query('DELETE FROM reports WHERE id=?', [req.params.id]); res.json({ message: 'Report deleted' }); };

exports.createPlan = async (req, res) => {
  const { title, price, duration_days } = req.body;
  const result = await query('INSERT INTO subscription_plans (title,price,duration_days) VALUES (?,?,?)', [title, price, duration_days]);
  res.status(201).json({ id: result.insertId });
};
exports.updatePlan = async (req, res) => { const { title, price, duration_days } = req.body; await query('UPDATE subscription_plans SET title=?,price=?,duration_days=? WHERE id=?', [title, price, duration_days, req.params.id]); res.json({ message: 'Plan updated' }); };
exports.deletePlan = async (req, res) => { await query('DELETE FROM subscription_plans WHERE id=?', [req.params.id]); res.json({ message: 'Plan deleted' }); };
exports.plans = async (_, res) => { const rows = await query('SELECT * FROM subscription_plans ORDER BY id DESC'); res.json(rows); };

exports.payments = async (_, res) => { const rows = await query('SELECT p.*,u.name,u.email FROM payments p JOIN users u ON u.id=p.user_id ORDER BY p.id DESC'); res.json(rows); };
exports.revenue = async (_, res) => { const [row] = await query('SELECT COALESCE(SUM(amount),0) as total_revenue FROM payments WHERE status="success"'); res.json(row); };

exports.notifyAll = async (req, res) => {
  const { title, body, type = 'admin_broadcast' } = req.body;
  const users = await query('SELECT id, device_token FROM users WHERE device_token IS NOT NULL');
  for (const user of users) {
    await query('INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)', [user.id, title, body, type]);
    await sendPushToToken(user.device_token, { title, body }, { type });
  }
  res.json({ message: 'Notification sent to all users' });
};

exports.notifyOne = async (req, res) => {
  const { title, body, type = 'admin_direct' } = req.body;
  const [user] = await query('SELECT id,device_token FROM users WHERE id=?', [req.params.id]);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await query('INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)', [user.id, title, body, type]);
  await sendPushToToken(user.device_token, { title, body }, { type });
  res.json({ message: 'Notification sent' });
};

exports.getSettings = async (_, res) => {
  const rows = await query('SELECT * FROM app_settings ORDER BY id ASC');
  res.json(rows);
};

exports.updateSettings = async (req, res) => {
  const settings = req.body.settings || [];
  for (const item of settings) {
    await query(
      'INSERT INTO app_settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_text=VALUES(value_text)',
      [item.key_name, item.value_text]
    );
  }
  res.json({ message: 'Settings updated' });
};
