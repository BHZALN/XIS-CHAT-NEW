const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const usersPath = path.join(__dirname, 'users.json');

// ✅ Add this route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Username and password required" });
  }

  let users = [];
  try {
    if (fs.existsSync(usersPath)) {
      const raw = fs.readFileSync(usersPath);
      users = raw.length ? JSON.parse(raw) : [];
    }
  } catch (err) {
    console.error("Error reading users.json:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

  if (users.some(u => u.username === username)) {
    return res.json({ success: false, message: "Username already exists" });
  }

  users.push({ username, password });

  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error writing to users.json:", err);
    res.status(500).json({ success: false, message: "Failed to save user" });
  }
});

// ✅ Optional: Existing login route
app.post('/login', (req, res) => {
  // your login code here
});

// ✅ Optional: Socket.IO real-time chat
io.on('connection', (socket) => {
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
