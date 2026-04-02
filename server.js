const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const MESSAGES_FILE = path.join(__dirname, "messages.json");
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, "[]");
let messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));

const users = {};

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    socket.username = username;
    socket.emit("history", messages.filter(m => m.type !== "voice"));
    io.emit("system", { text: `${username} انضم إلى المحادثة`, time: getTime() });
    io.emit("users", Object.values(users));
  });

  socket.on("message", (data) => {
    const username = users[socket.id] || "مجهول";
    const msgData = { id: socket.id, username, text: data.text, time: getTime() };
    io.emit("message", msgData);
    messages.push(msgData);
    saveMessages();
  });

  socket.on("voice", (data) => {
    const username = users[socket.id] || "مجهول";
    const voiceData = {
      id: socket.id, username,
      audio: data.audio, duration: data.duration,
      time: getTime(), type: "voice",
    };
    io.emit("voice", voiceData);
    messages.push({ ...voiceData, audio: null, savedVoice: true });
    saveMessages();
  });

  socket.on("stream-offer", (data) => {
    socket.broadcast.emit("stream-offer", { offer: data.offer, from: socket.id });
  });
  socket.on("stream-answer", (data) => {
    socket.broadcast.emit("stream-answer", { answer: data.answer });
  });
  socket.on("stream-ice", (data) => {
    socket.broadcast.emit("stream-ice", { candidate: data.candidate });
  });
  socket.on("stream-end", () => {
    socket.broadcast.emit("stream-end");
  });

  socket.on("typing", (isTyping) => {
    socket.broadcast.emit("typing", { username: users[socket.id],isTyping});
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      io.emit("system", { text: `${username} غادر المحادثة`, time: getTime() });
      io.emit("users", Object.values(users));
    }
  });
});

function saveMessages() {
  if (messages.length > 500) messages = messages.slice(-500);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

function getTime() {
  return new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`🚀 Server running at http://localhost:${PORT}`); });