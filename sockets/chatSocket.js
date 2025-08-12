const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Optional: keep track of online users
  const online = new Map();

  io.use((socket, next) => {
    // token can be passed in socket.handshake.auth.token
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id, username: payload.username };
    } catch (err) {
      // ignore - allow anonymous sockets too if you want
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log('🔌 socket connected', socket.id, socket.user && socket.user.username);
    if (socket.user) online.set(socket.user.id, socket.id);

    socket.on('joinChannel', (channelId) => {
      socket.join(channelId);
      console.log(`${socket.user ? socket.user.username : socket.id} joined ${channelId}`);
      // emit presence or history hooks if needed
    });

    socket.on('leaveChannel', (channelId) => {
      socket.leave(channelId);
    });

    socket.on('sendMessage', async (payload) => {
      // payload: { channelId, content }
      try {
        const Message = require('../models/Message');
        const msg = await Message.create({ sender: socket.user ? socket.user.id : null, channel: payload.channelId, content: payload.content });
        await msg.populate('sender', 'username avatar');
        io.to(payload.channelId).emit('receiveMessage', msg);
      } catch (err) {
        console.error('sendMessage error', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ socket disconnected', socket.id);
      if (socket.user) online.delete(socket.user.id);
    });
  });
};