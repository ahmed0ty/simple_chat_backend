const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

const MESSAGES_FILE = path.join(__dirname, "messages.json");

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, "[]");
}

let messages = [];
try {
  messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
  if (!Array.isArray(messages)) messages = [];
} catch (err) {
  messages = [];
}

const users = {};

io.on("connection", (socket) => {

  const keepAlive = setInterval(() => {
    socket.emit("ping");
  }, 25000);

  socket.on("join", (username) => {
    users[socket.id] = username;
    socket.username = username;
    socket.emit("history", messages.filter((m) => m.type !== "voice"));
    io.emit("system", { text: `${username} انضم إلى المحادثة`, time: getTime() });
    io.emit("users", Object.values(users));
  });

  socket.on("message", (data) => {
    const username = users[socket.id] || "مجهول";
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    if (!text) return;
    const msgData = { id: socket.id, username, text, time: getTime(), type: "text" };
    messages.push(msgData);
    io.emit("message", msgData);
    saveMessages();
  });

  socket.on("voice", (data) => {
    const username = users[socket.id] || "مجهول";
    if (!data?.audio) return;
    const voiceData = { id: socket.id, username, audio: data.audio, duration: data.duration || 0, time: getTime(), type: "voice" };
    io.emit("voice", voiceData);
    messages.push({ id: socket.id, username, time: voiceData.time, duration: voiceData.duration, type: "voice", savedVoice: true });
    saveMessages();
  });

  // رفع صورة أو فيديو - بدون تخزين، فقط بث مباشر للجميع
  socket.on("media-upload", (data) => {
    const username = users[socket.id] || "مجهول";
    if (!data?.dataUrl || !data?.mediaType) return;
    io.emit("media-upload", {
      id: socket.id,
      username,
      dataUrl: data.dataUrl,
      mediaType: data.mediaType,
      fileName: data.fileName || "",
      time: getTime()
    });
  });

  socket.on("stream-offer", (data) => {
    socket.broadcast.emit("stream-offer", { offer: data.offer, from: socket.id });
  });

  socket.on("stream-answer", (data) => {
    socket.broadcast.emit("stream-answer", { answer: data.answer });
  });

  socket.on("stream-ice", (data) => {
    socket.broadcast.emit("stream-ice", { candidate: data.candidate, from: socket.id });
  });

  socket.on("typing", (isTyping) => {
    socket.broadcast.emit("typing", { username: users[socket.id], isTyping });
  });

  socket.on("disconnect", () => {
    clearInterval(keepAlive);
    const username = users[socket.id];
    socket.broadcast.emit("stream-end", { from: socket.id });
    if (username) {
      delete users[socket.id];
      io.emit("system", { text: `${username} غادر المحادثة`, time: getTime() });
      io.emit("users", Object.values(users));
    }
  });
});

function saveMessages() {
  if (messages.length > 500) messages = messages.slice(-500);
  fs.writeFile(MESSAGES_FILE, JSON.stringify(messages), (err) => {
    if (err) console.error("Error saving messages:", err);
  });
}

function getTime() {
  return new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });