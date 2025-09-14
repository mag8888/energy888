const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

console.log('Starting server on port', PORT);

const html = `<!DOCTYPE html>
<html>
<head>
    <title>Energy of Money</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
        .container { background: white; padding: 40px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
        h1 { color: #333; }
        .status { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Energy of Money</h1>
        <div class="status">✅ Server Running</div>
        <p>Welcome to Energy of Money game!</p>
    </div>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        socket.on('connect', () => console.log('Connected'));
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('Webhook received');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
});

const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('welcome', { message: 'Welcome to Energy of Money!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});