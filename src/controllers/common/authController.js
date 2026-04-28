const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const generateToken = require('../../utils/generateToken');
const { validateRequired, validateEmail } = require('../../utils/validators');

const otpStore = new Map();

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const validation = validateRequired(req.body, ['name', 'email', 'password']);
  if (!validation.isValid) return res.status(400).json({ message: `Missing fields: ${validation.missing.join(', ')}` });
  if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });

  const existing = await query('SELECT id FROM users WHERE email=? LIMIT 1', [email]);
  if (existing.length) return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const result = await query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hashed]);
  const token = generateToken({ id: result.insertId, email, type: 'user' });
  return res.status(201).json({ message: 'Registered successfully', token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [user] = await query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken({ id: user.id, email: user.email, type: 'user' });
  return res.json({ message: 'Login successful', token });
};

exports.logout = async (_, res) => res.json({ message: 'Logout successful (client should remove token)' });

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const [user] = await query('SELECT id FROM users WHERE email=? LIMIT 1', [email]);
  if (!user) return res.status(404).json({ message: 'Email not found' });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(email, otp);
  return res.json({ message: 'OTP generated (send via email service in production)', otp });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore.get(email) !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  return res.json({ message: 'OTP verified' });
};

exports.resendOtp = async (req, res) => exports.forgotPassword(req, res);

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (otpStore.get(email) !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password=? WHERE email=?', [hashed, email]);
  otpStore.delete(email);
  return res.json({ message: 'Password reset successful' });
};

exports.socialLogin = async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: 'email is required' });

  let [user] = await query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
  if (!user) {
    const randomPass = await bcrypt.hash(`social_${Date.now()}`, 10);
    const result = await query('INSERT INTO users (name,email,password,is_verified) VALUES (?,?,?,1)', [name || 'Social User', email, randomPass]);
    [user] = await query('SELECT * FROM users WHERE id=?', [result.insertId]);
  }

  const token = generateToken({ id: user.id, email: user.email, type: 'user' });
  return res.json({ message: 'Social login successful', token });
};

exports.me = async (req, res) => {
  const [user] = await query('SELECT id,name,email,phone,gender,age,bio,city,state,country,profile_image,is_verified,is_active,last_seen,created_at FROM users WHERE id=?', [req.user.id]);
  return res.json(user || null);
};
