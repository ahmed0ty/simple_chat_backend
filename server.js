
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
const MISSED_FILE = path.join(__dirname, "missed.json");

if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, "[]");
if (!fs.existsSync(MISSED_FILE)) fs.writeFileSync(MISSED_FILE, "[]");

let messages = [];
try {
  messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8"));
  if (!Array.isArray(messages)) messages = [];
} catch (err) { messages = []; }

let missedMessages = [];
try {
  missedMessages = JSON.parse(fs.readFileSync(MISSED_FILE, "utf8"));
  if (!Array.isArray(missedMessages)) missedMessages = [];
} catch (err) { missedMessages = []; }

const users = {};
const OWNER_NAME = "ahmedtony@#";

function isOwnerOnline() {
  return Object.values(users).some(u => u === OWNER_NAME);
}

function getRoomCount() {
  return Object.keys(users).length;
}

// ===== صفحة رسائل الغياب =====
app.get("/missed", (req, res) => {
  const msgs = missedMessages.slice(-100);
  let rows = msgs.length === 0
    ? `<div class="empty">لا توجد رسائل غياب</div>`
    : msgs.map(m => `
        <div class="msg-card">
          <div class="meta"><span class="name">${escHtml(m.username)}</span><span class="time">${escHtml(m.time)}</span></div>
          <div class="text">${escHtml(m.text)}</div>
        </div>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>رسائل الغياب</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Cairo',sans-serif;background:#0d0f14;color:#e8eaf2;min-height:100vh;padding:24px 16px}
h1{font-size:22px;font-weight:900;margin-bottom:6px;background:linear-gradient(135deg,#4f8ef7,#7c5cfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{font-size:13px;color:#6b7394;margin-bottom:24px}
.msg-card{background:#161920;border:1px solid #252a3a;border-radius:16px;padding:16px 20px;margin-bottom:12px}
.meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.name{font-weight:700;font-size:14px;color:#4f8ef7}
.time{font-size:12px;color:#6b7394}
.text{font-size:15px;line-height:1.6;word-break:break-word}
.empty{text-align:center;color:#6b7394;padding:60px 0;font-size:15px}
.clear-btn{display:inline-block;margin-bottom:20px;padding:10px 24px;background:rgba(239,68,68,.15);border:1px solid #ef4444;border-radius:12px;color:#ef4444;font-family:'Cairo',sans-serif;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none}
.clear-btn:hover{background:rgba(239,68,68,.3)}
</style>
</head>
<body>
<h1>📬 رسائل الغياب</h1>
<p class="sub">الرسائل اللي اتبعتت وانت مش موجود (آخر 100 رسالة)</p>
<a class="clear-btn" href="/missed/clear">🗑️ مسح الكل</a>
${rows}
</body>
</html>`);
});

app.get("/missed/clear", (req, res) => {
  missedMessages = [];
  saveMissed();
  res.redirect("/missed");
});

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

io.on("connection", (socket) => {

  const keepAlive = setInterval(() => {
    socket.emit("ping");
  }, 25000);

  socket.on("join", (username) => {
    const name = (username || "").trim();

    // الغرفة ممتلئة (أكثر من 2)
    if (getRoomCount() >= 2) {
      socket.emit("join-rejected", { reason: "الغرفة ممتلئة! مسموح بشخصين فقط." });
      socket.disconnect(true);
      return;
    }

    // لو مفيش مالك ومش هو المالك → ارفض
    if (!isOwnerOnline() && name !== OWNER_NAME) {
      socket.emit("join-rejected", { reason: "مش مسموح بالدخول بدون المالك." });
      socket.disconnect(true);
      return;
    }

    users[socket.id] = name;
    socket.username = name;

    const displayName = name === OWNER_NAME ? "المالك" : name;

    socket.emit("history", messages.filter(m => m.type !== "voice"));
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

    // لو المالك مش موجود، احفظ الرسالة في الغياب
    if (!isOwnerOnline()) {
      missedMessages.push({ username: displayName, text, time: getTime() });
      saveMissed();
    }
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

  // ===== البث المباشر - فقط للشخص الثاني =====
  socket.on("stream-offer", (data) => {
    if (!users[socket.id]) return;
    // أرسل فقط للشخص الآخر (مش broadcast عام)
    socket.broadcast.emit("stream-offer", { offer: data.offer, from: socket.id });
  });

  socket.on("stream-answer", (data) => {
    socket.broadcast.emit("stream-answer", { answer: data.answer });
  });

  socket.on("stream-ice", (data) => {
    socket.broadcast.emit("stream-ice", { candidate: data.candidate, from: socket.id });
  });

  // ===== المكالمة الصوتية - فقط للشخص الثاني =====
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
    setTimeout(() => { io.disconnectSockets(true); }, 1000);
  });

  socket.on("pong", () => {});

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
  fs.writeFile(MESSAGES_FILE, JSON.stringify(messages), err => { if (err) console.error(err); });
}

function saveMissed() {
  if (missedMessages.length > 200) missedMessages = missedMessages.slice(-200);
  fs.writeFile(MISSED_FILE, JSON.stringify(missedMessages), err => { if (err) console.error(err); });
}

function getTime() {
  return new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });