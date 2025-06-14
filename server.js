const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// User login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json'));
  const found = users.find(u => u.username === username && u.password === password);
  res.json({ success: !!found });
});
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync('users.json'));

  // check if username already exists
  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.json({ success: false, message: 'Username already exists' });
  }

  // add new user
  users.push({ username, password });

  // save to users.json
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));

  res.json({ success: true });
});

// Chat system
io.on('connection', socket => {
  socket.on('user joined', username => {
    socket.username = username;
    socket.broadcast.emit('system message', `${username} joined the chat.`);
  });

  socket.on('chat message', ({ user, msg }) => {
    io.emit('chat message', {
      user,
      msg,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('system message', `${socket.username} left the chat.`);
    }
  });
});

http.listen(PORT, () => {
  console.log(`🚀 XIS CHAT running at http://localhost:${PORT}`);
});
