const onlineUsers = new Map();

function addOnlineUser(userId, socketId) {
  const key = String(userId);
  if (!onlineUsers.has(key)) onlineUsers.set(key, new Set());
  onlineUsers.get(key).add(socketId);
}

function removeOnlineUser(userId, socketId) {
  const key = String(userId);
  const set = onlineUsers.get(key);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(key);
}

function emitToUser(io, userId, event, payload) {
  const set = onlineUsers.get(String(userId));
  if (!set) return;
  set.forEach((socketId) => io.to(socketId).emit(event, payload));
}

module.exports = { addOnlineUser, removeOnlineUser, emitToUser };
