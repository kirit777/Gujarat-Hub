const { query } = require('../../config/db');

exports.getProfile = async (req, res) => {
  const [row] = await query('SELECT id,name,email,phone,gender,age,bio,city,state,country,latitude,longitude,profile_image,is_verified,is_active,last_seen,device_token,created_at FROM users WHERE id=?', [req.user.id]);
  res.json(row || null);
};

exports.updateProfile = async (req, res) => {
  const { name, phone, gender, age, bio, city, state, country } = req.body;
  await query(
    'UPDATE users SET name=?, phone=?, gender=?, age=?, bio=?, city=?, state=?, country=? WHERE id=?',
    [name, phone, gender, age, bio, city, state, country, req.user.id]
  );
  res.json({ message: 'Profile updated' });
};

exports.uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image is required' });
  const fileUrl = `${process.env.BASE_URL || ''}/uploads/${req.file.filename}`;
  const result = await query('INSERT INTO user_photos (user_id,image_url) VALUES (?,?)', [req.user.id, fileUrl]);
  res.status(201).json({ message: 'Photo uploaded', id: result.insertId, image_url: fileUrl });
};

exports.deletePhoto = async (req, res) => {
  await query('DELETE FROM user_photos WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ message: 'Photo deleted' });
};

exports.getPhotos = async (req, res) => {
  const rows = await query('SELECT * FROM user_photos WHERE user_id=? ORDER BY id DESC', [req.user.id]);
  res.json(rows);
};

exports.updateLocation = async (req, res) => {
  const { latitude, longitude, city, state, country } = req.body;
  await query('UPDATE users SET latitude=?, longitude=?, city=?, state=?, country=? WHERE id=?', [latitude, longitude, city, state, country, req.user.id]);
  res.json({ message: 'Location updated' });
};

exports.updateDeviceToken = async (req, res) => {
  const { device_token } = req.body;
  await query('UPDATE users SET device_token=? WHERE id=?', [device_token, req.user.id]);
  res.json({ message: 'Device token updated' });
};
