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
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: 'Missing fields' });

    let users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];

    if (users.find(u => u.username === username)) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    users.push({ username, password });
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ Optional: Existing login route
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: 'Missing credentials' });

    const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath)) : [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) return res.json({ success: true });
    return res.json({ success: false, message: 'Invalid credentials' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
