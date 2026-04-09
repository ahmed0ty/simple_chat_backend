// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   transports: ["websocket", "polling"],
//   cors: { origin: "*" }
// });

// app.use(express.static(path.join(__dirname, "public")));

// const MESSAGES_FILE = path.join(__dirname, "messages.json");

// if (!fs.existsSync(MESSAGES_FILE)) {
//   fs.writeFileSync(MESSAGES_FILE, "[]");
// }

// let messages = [];
// try {
//   messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
//   if (!Array.isArray(messages)) messages = [];
// } catch (err) {
//   messages = [];
// }

// const users = {};

// io.on("connection", (socket) => {

//   const keepAlive = setInterval(() => {
//     socket.emit("ping");
//   }, 25000);

//   socket.on("join", (username) => {
//     users[socket.id] = username;
//     socket.username = username;
//     socket.emit("history", messages.filter((m) => m.type !== "voice"));
//     io.emit("system", { text: `${username} انضم إلى المحادثة`, time: getTime() });
//     io.emit("users", Object.values(users));
//   });

//   socket.on("message", (data) => {
//     const username = users[socket.id] || "مجهول";
//     const text = typeof data?.text === "string" ? data.text.trim() : "";
//     if (!text) return;
//     const msgData = { id: socket.id, username, text, time: getTime(), type: "text" };
//     messages.push(msgData);
//     io.emit("message", msgData);
//     saveMessages();
//   });

//   socket.on("voice", (data) => {
//     const username = users[socket.id] || "مجهول";
//     if (!data?.audio) return;
//     const voiceData = { id: socket.id, username, audio: data.audio, duration: data.duration || 0, time: getTime(), type: "voice" };
//     io.emit("voice", voiceData);
//     messages.push({ id: socket.id, username, time: voiceData.time, duration: voiceData.duration, type: "voice", savedVoice: true });
//     saveMessages();
//   });

//   // رفع صورة أو فيديو - بدون تخزين، فقط بث مباشر للجميع
//   socket.on("media-upload", (data) => {
//     const username = users[socket.id] || "مجهول";
//     if (!data?.dataUrl || !data?.mediaType) return;
//     io.emit("media-upload", {
//       id: socket.id,
//       username,
//       dataUrl: data.dataUrl,
//       mediaType: data.mediaType,
//       fileName: data.fileName || "",
//       time: getTime()
//     });
//   });

//   socket.on("stream-offer", (data) => {
//     socket.broadcast.emit("stream-offer", { offer: data.offer, from: socket.id });
//   });

//   socket.on("stream-answer", (data) => {
//     socket.broadcast.emit("stream-answer", { answer: data.answer });
//   });

//   socket.on("stream-ice", (data) => {
//     socket.broadcast.emit("stream-ice", { candidate: data.candidate, from: socket.id });
//   });

//   socket.on("typing", (isTyping) => {
//     socket.broadcast.emit("typing", { username: users[socket.id], isTyping });
//   });

//   socket.on("disconnect", () => {
//     clearInterval(keepAlive);
//     const username = users[socket.id];
//     socket.broadcast.emit("stream-end", { from: socket.id });
//     if (username) {
//       delete users[socket.id];
//       io.emit("system", { text: `${username} غادر المحادثة`, time: getTime() });
//       io.emit("users", Object.values(users));
//     }
//   });
// });

// function saveMessages() {
//   if (messages.length > 500) messages = messages.slice(-500);
//   fs.writeFile(MESSAGES_FILE, JSON.stringify(messages), (err) => {
//     if (err) console.error("Error saving messages:", err);
//   });
// }

// function getTime() {
//   return new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
// }

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });















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

// ======= الاسم السري للمالك =======
const OWNER_NAME = "ahmedtony@#";
// ==================================

function isOwnerOnline() {
  return Object.values(users).includes(OWNER_NAME);
}

function getRoomCount() {
  return Object.keys(users).length;
}

io.on("connection", (socket) => {

  const keepAlive = setInterval(() => {
    socket.emit("ping");
  }, 25000);

  socket.on("join", (username) => {
    const name = (username || "").trim();

    // ===== قواعد الدخول =====

    // 1. لو الغرفة وصلت 2 → ممنوع لأي حد
    if (getRoomCount() >= 2) {
      socket.emit("join-rejected", { reason: "الغرفة ممتلئة! مسموح بشخصين فقط." });
      socket.disconnect(true);
      return;
    }

    // 2. لو مفيش أوونر في الغرفة والشخص ده مش الأوونر
    //    → ممنوع يدخل (لازم الأوونر يكون أول واحد أو موجود)
    if (!isOwnerOnline() && name !== OWNER_NAME) {
      socket.emit("join-rejected", { reason: "مش مسموح بالدخول بدون المالك." });
      socket.disconnect(true);
      return;
    }

    // ===== دخول مقبول =====
    users[socket.id] = name;
    socket.username = name;

    // إخفاء الاسم السري - يظهر للكل كـ "المالك"
    const displayName = name === OWNER_NAME ? "المالك" : name;

    socket.emit("history", messages.filter((m) => m.type !== "voice"));
    io.emit("system", { text: `${displayName} انضم إلى المحادثة`, time: getTime() });

    // إرسال قائمة المستخدمين مع إخفاء الاسم السري
    emitUsers();
  });

  socket.on("message", (data) => {
    const rawName = users[socket.id] || "مجهول";
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    if (!text) return;
    const msgData = { id: socket.id, username: displayName, text, time: getTime(), type: "text" };
    messages.push(msgData);
    io.emit("message", msgData);
    saveMessages();
  });

  socket.on("voice", (data) => {
    const rawName = users[socket.id] || "مجهول";
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    if (!data?.audio) return;
    const voiceData = { id: socket.id, username: displayName, audio: data.audio, duration: data.duration || 0, time: getTime(), type: "voice" };
    io.emit("voice", voiceData);
    messages.push({ id: socket.id, username: displayName, time: voiceData.time, duration: voiceData.duration, type: "voice", savedVoice: true });
    saveMessages();
  });

  socket.on("media-upload", (data) => {
    const rawName = users[socket.id] || "مجهول";
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    if (!data?.dataUrl || !data?.mediaType) return;
    io.emit("media-upload", {
      id: socket.id,
      username: displayName,
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
    const rawName = users[socket.id] || "مجهول";
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    socket.broadcast.emit("typing", { username: displayName, isTyping });
  });

  socket.on("disconnect", () => {
    clearInterval(keepAlive);
    const rawName = users[socket.id];
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    socket.broadcast.emit("stream-end", { from: socket.id });
    if (rawName) {
      delete users[socket.id];
      io.emit("system", { text: `${displayName} غادر المحادثة`, time: getTime() });
      emitUsers();
    }
  });
});

// إرسال قائمة المستخدمين مع إخفاء الاسم السري
function emitUsers() {
  const displayList = Object.values(users).map(n => n === OWNER_NAME ? "المالك" : n);
  io.emit("users", displayList);
}

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