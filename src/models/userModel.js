const { query } = require('../config/db');

const userModel = {
  create: (payload) => query(
    `INSERT INTO users (name,email,phone,password,gender,age,bio,city,state,country,latitude,longitude,profile_image,device_token)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      payload.name, payload.email, payload.phone || null, payload.password, payload.gender || null,
      payload.age || null, payload.bio || null, payload.city || null, payload.state || null,
      payload.country || null, payload.latitude || null, payload.longitude || null,
      payload.profile_image || null, payload.device_token || null
    ]
  ),
  findByEmail: (email) => query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]),
  findById: (id) => query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]),
  updateProfile: (id, payload) => query(
    `UPDATE users SET name=?, phone=?, gender=?, age=?, bio=?, city=?, state=?, country=?, profile_image=? WHERE id=?`,
    [payload.name, payload.phone, payload.gender, payload.age, payload.bio, payload.city, payload.state, payload.country, payload.profile_image, id]
  )
};

module.exports = userModel;
