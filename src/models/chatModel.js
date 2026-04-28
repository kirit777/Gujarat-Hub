const { query } = require('../config/db');

const chatModel = {
  createMessage: (senderId, receiverId, message, messageType = 'text') => query(
    'INSERT INTO chats (sender_id, receiver_id, message, message_type) VALUES (?,?,?,?)',
    [senderId, receiverId, message, messageType]
  ),
  listConversations: (userId, limit, offset) => query(
    `SELECT c.* FROM chats c
     JOIN (
      SELECT LEAST(sender_id, receiver_id) a, GREATEST(sender_id, receiver_id) b, MAX(id) max_id
      FROM chats WHERE sender_id=? OR receiver_id=? GROUP BY a,b
     ) x ON c.id=x.max_id
     ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [userId, userId, limit, offset]
  )
};

module.exports = chatModel;
