
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

// const OWNER_NAME = "ahmedtony@#";

// function isOwnerOnline() {
//   return Object.values(users).includes(OWNER_NAME);
// }

// function getRoomCount() {
//   return Object.keys(users).length;
// }

// io.on("connection", (socket) => {

//   const keepAlive = setInterval(() => {
//     socket.emit("ping");
//   }, 25000);

//   socket.on("join", (username) => {
//     const name = (username || "").trim();

//    if (getRoomCount() >= 2) {
//   socket.emit("join-rejected", { reason: "الغرفة ممتلئة! مسموح بشخصين فقط." });
//   socket.disconnect(true);
//   return;
// }

// users[socket.id] = name;
// socket.username = name;

// if (!isOwnerOnline() && name !== OWNER_NAME) {
//   socket.emit("join-rejected", { reason: "مش مسموح بالدخول بدون المالك." });
//   delete users[socket.id];
//   socket.disconnect(true);
//   return;
// }

//     users[socket.id] = name;
//     socket.username = name;

//     const displayName = name === OWNER_NAME ? "المالك" : name;

//     socket.emit("history", messages.filter((m) => m.type !== "voice"));
//     io.emit("system", { text: `${displayName} انضم إلى المحادثة`, time: getTime() });
//     emitUsers();
//   });

//   socket.on("message", (data) => {
//     const rawName = users[socket.id] || "مجهول";
//     const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
//     const text = typeof data?.text === "string" ? data.text.trim() : "";
//     if (!text) return;
//     const msgData = { id: socket.id, username: displayName, text, time: getTime(), type: "text" };
//     messages.push(msgData);
//     io.emit("message", msgData);
//     saveMessages();
//   });

//   socket.on("voice", (data) => {
//     const rawName = users[socket.id] || "مجهول";
//     const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
//     if (!data?.audio) return;
//     const voiceData = { id: socket.id, username: displayName, audio: data.audio, duration: data.duration || 0, time: getTime(), type: "voice" };
//     io.emit("voice", voiceData);
//     messages.push({ id: socket.id, username: displayName, time: voiceData.time, duration: voiceData.duration, type: "voice", savedVoice: true });
//     saveMessages();
//   });

//   socket.on("media-upload", (data) => {
//     const rawName = users[socket.id] || "مجهول";
//     const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
//     if (!data?.dataUrl || !data?.mediaType) return;
//     io.emit("media-upload", {
//       id: socket.id,
//       username: displayName,
//       dataUrl: data.dataUrl,
//       mediaType: data.mediaType,
//       fileName: data.fileName || "",
//       time: getTime()
//     });
//   });

//   socket.on("stream-offer", (data) => {
//     // البث بس لو المرسل جوا الشات (موجود في users)
//     if (!users[socket.id]) return;
//     socket.broadcast.emit("stream-offer", { offer: data.offer, from: socket.id });
//   });

//   socket.on("stream-answer", (data) => {
//     socket.broadcast.emit("stream-answer", { answer: data.answer });
//   });

//   socket.on("stream-ice", (data) => {
//     socket.broadcast.emit("stream-ice", { candidate: data.candidate, from: socket.id });
//   });

//   socket.on("typing", (isTyping) => {
//     const rawName = users[socket.id] || "مجهول";
//     const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
//     socket.broadcast.emit("typing", { username: displayName, isTyping });
//   });

//   // زر خروج المالك - يطرد الكل
//   socket.on("owner-logout", () => {
//     if (users[socket.id] !== OWNER_NAME) return;
//     io.emit("force-logout", { reason: "المالك أنهى المحادثة." });
//     setTimeout(() => {
//       io.disconnectSockets(true);
//     }, 1000);
//   });

//   socket.on("disconnect", () => {
//     clearInterval(keepAlive);
//     const rawName = users[socket.id];
//     const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
//     socket.broadcast.emit("stream-end", { from: socket.id });
//     if (rawName) {
//       delete users[socket.id];
//       io.emit("system", { text: `${displayName} غادر المحادثة`, time: getTime() });
//       emitUsers();
//     }
//   });
// });

// function emitUsers() {
//   const displayList = Object.values(users).map(n => n === OWNER_NAME ? "المالك" : n);
//   io.emit("users", displayList);
// }

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
const OWNER_NAME = "ahmedtony@#";

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

    if (getRoomCount() >= 2) {
      socket.emit("join-rejected", { reason: "الغرفة ممتلئة! مسموح بشخصين فقط." });
      socket.disconnect(true);
      return;
    }

    users[socket.id] = name;
    socket.username = name;

    if (!isOwnerOnline() && name !== OWNER_NAME) {
      socket.emit("join-rejected", { reason: "مش مسموح بالدخول بدون المالك." });
      delete users[socket.id];
      socket.disconnect(true);
      return;
    }

    users[socket.id] = name;
    socket.username = name;

    const displayName = name === OWNER_NAME ? "المالك" : name;

    socket.emit("history", messages.filter((m) => m.type !== "voice"));
    io.emit("system", { text: `${displayName} انضم إلى المحادثة`, time: getTime() });
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

  // ===== البث المباشر =====
  socket.on("stream-offer", (data) => {
    if (!users[socket.id]) return;
    socket.broadcast.emit("stream-offer", { offer: data.offer, from: socket.id });
  });

  socket.on("stream-answer", (data) => {
    socket.broadcast.emit("stream-answer", { answer: data.answer });
  });

  socket.on("stream-ice", (data) => {
    socket.broadcast.emit("stream-ice", { candidate: data.candidate, from: socket.id });
  });

  // ===== المكالمة الصوتية =====
  socket.on("call-offer", (data) => {
    if (!users[socket.id]) return;
    const rawName = users[socket.id];
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    socket.broadcast.emit("call-offer", { offer: data.offer, from: socket.id, callerName: displayName });
  });

  socket.on("call-answer", (data) => {
    socket.broadcast.emit("call-answer", { answer: data.answer });
  });

  socket.on("call-ice", (data) => {
    socket.broadcast.emit("call-ice", { candidate: data.candidate });
  });

  socket.on("call-end", () => {
    socket.broadcast.emit("call-end");
  });

  socket.on("call-reject", () => {
    socket.broadcast.emit("call-reject");
  });

  // ===== typing =====
  socket.on("typing", (isTyping) => {
    const rawName = users[socket.id] || "مجهول";
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    socket.broadcast.emit("typing", { username: displayName, isTyping });
  });

  // ===== خروج المالك القسري =====
  socket.on("owner-logout", () => {
    if (users[socket.id] !== OWNER_NAME) return;
    io.emit("force-logout", { reason: "المالك أنهى المحادثة." });
    setTimeout(() => {
      io.disconnectSockets(true);
    }, 1000);
  });

  socket.on("disconnect", () => {
    clearInterval(keepAlive);
    const rawName = users[socket.id];
    const displayName = rawName === OWNER_NAME ? "المالك" : rawName;
    socket.broadcast.emit("stream-end", { from: socket.id });
    socket.broadcast.emit("call-end");
    if (rawName) {
      delete users[socket.id];
      io.emit("system", { text: `${displayName} غادر المحادثة`, time: getTime() });
      emitUsers();
    }
  });
});

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