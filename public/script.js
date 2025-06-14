const socket = io();
const user = localStorage.getItem('user');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

socket.emit('user joined', user);

socket.on('chat message', ({ user, msg, time }) => {
  const el = document.createElement('div');
  el.className = 'message';
  el.innerHTML = `<span>${user}</span> [${time}]: ${msg}`;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('system message', text => {
  const el = document.createElement('div');
  el.className = 'system';
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
});

function sendMessage() {
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chat message', { user, msg });
    input.value = '';
  }
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
