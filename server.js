const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Kết nối MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/chatapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));

// Schema cho tin nhắn
const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  time: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

// Khi có client kết nối
io.on("connection", (socket) => {
  console.log("🔵 User connected");

  // Gửi tất cả tin nhắn cũ khi user vào
  Message.find().sort({ time: 1 }).then(messages => {
    socket.emit("chatHistory", messages);
  });

  // Nhận tin nhắn mới
  socket.on("sendMessage", (msg) => {
    const message = new Message(msg);
    message.save().then(() => {
      io.emit("newMessage", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

server.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
