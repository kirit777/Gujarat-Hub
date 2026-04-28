const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      gender ENUM('male','female','other') DEFAULT NULL,
      age INT DEFAULT NULL,
      bio TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      profile_image VARCHAR(255),
      is_verified TINYINT(1) DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      device_token VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'super_admin'
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS user_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      is_primary TINYINT(1) DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      from_user_id INT NOT NULL,
      to_user_id INT NOT NULL,
      status ENUM('like','dislike','super_like') DEFAULT 'like',
      UNIQUE KEY unique_like (from_user_id, to_user_id),
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS matches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user1_id INT NOT NULL,
      user2_id INT NOT NULL,
      UNIQUE KEY unique_match (user1_id, user2_id),
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS chats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT,
      message_type ENUM('text','image','video','audio') DEFAULT 'text',
      is_seen TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS chat_media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chat_id INT NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      body TEXT,
      type VARCHAR(50) DEFAULT 'system',
      is_read TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reporter_id INT NOT NULL,
      reported_user_id INT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS blocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blocker_id INT NOT NULL,
      blocked_id INT NOT NULL,
      UNIQUE KEY unique_block (blocker_id, blocked_id),
      FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS subscription_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration_days INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_id VARCHAR(150) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS app_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(100) NOT NULL UNIQUE,
      value_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await connection.commit();

    const admins = await query('SELECT id FROM admins LIMIT 1');
    if (!admins.length) {
      const hashed = await bcrypt.hash('admin123', 10);
      await query('INSERT INTO admins (name,email,password,role) VALUES (?,?,?,?)', ['Super Admin', 'admin@example.com', hashed, 'super_admin']);
      console.log('Default admin created: admin@example.com / admin123');
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { initDatabase };
