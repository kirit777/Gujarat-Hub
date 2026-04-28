const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { addOnlineUser, removeOnlineUser, emitToUser } = require('../services/chatService');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    addOnlineUser(userId, socket.id);
    io.emit('user_online', { userId });

    socket.on('typing', ({ toUserId, isTyping }) => {
      emitToUser(io, toUserId, 'typing', { fromUserId: userId, isTyping });
    });

    socket.on('seen_message', ({ toUserId, chatId }) => {
      emitToUser(io, toUserId, 'seen_message', { chatId, byUserId: userId });
    });

    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);
      io.emit('user_offline', { userId });
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
