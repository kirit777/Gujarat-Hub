const { query } = require('../../config/db');
const { getIO } = require('../../config/socket');
const { emitToUser } = require('../../services/chatService');
const { pagination } = require('../../utils/helpers');

exports.chatList = async (req, res) => {
  const { page, limit, offset } = pagination(req.query);
  const rows = await query(
    `SELECT c.* FROM chats c
     JOIN (
       SELECT LEAST(sender_id,receiver_id) a, GREATEST(sender_id,receiver_id) b, MAX(id) max_id
       FROM chats WHERE sender_id=? OR receiver_id=? GROUP BY a,b
     ) t ON c.id=t.max_id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [req.user.id, req.user.id, limit, offset]
  );
  res.json({ page, limit, data: rows });
};

exports.messagesWithUser = async (req, res) => {
  const rows = await query(
    `SELECT * FROM chats WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY id ASC`,
    [req.user.id, req.params.userId, req.params.userId, req.user.id]
  );
  res.json(rows);
};

exports.sendMessage = async (req, res) => {
  const { receiver_id, message, message_type = 'text' } = req.body;
  const result = await query('INSERT INTO chats (sender_id,receiver_id,message,message_type) VALUES (?,?,?,?)', [req.user.id, receiver_id, message, message_type]);
  const [row] = await query('SELECT * FROM chats WHERE id=?', [result.insertId]);
  const io = getIO();
  if (io) emitToUser(io, receiver_id, 'new_message', row);
  res.status(201).json(row);
};

exports.sendImageMessage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image required' });
  const receiverId = req.body.receiver_id;
  const fileUrl = `${process.env.BASE_URL || ''}/uploads/${req.file.filename}`;
  const result = await query('INSERT INTO chats (sender_id,receiver_id,message,message_type) VALUES (?,?,?,?)', [req.user.id, receiverId, fileUrl, 'image']);
  await query('INSERT INTO chat_media (chat_id,file_url) VALUES (?,?)', [result.insertId, fileUrl]);
  const [row] = await query('SELECT * FROM chats WHERE id=?', [result.insertId]);
  const io = getIO();
  if (io) emitToUser(io, receiverId, 'new_message', row);
  res.status(201).json(row);
};

exports.markSeen = async (req, res) => {
  await query('UPDATE chats SET is_seen=1 WHERE id=? AND receiver_id=?', [req.params.chatId, req.user.id]);
  res.json({ message: 'Message marked as seen' });
};

exports.deleteChat = async (req, res) => {
  await query('DELETE FROM chats WHERE id=? AND (sender_id=? OR receiver_id=?)', [req.params.chatId, req.user.id, req.user.id]);
  res.json({ message: 'Chat deleted' });
};
