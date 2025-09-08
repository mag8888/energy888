const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Energy888 Socket Server is running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    host: HOST,
    timestamp: new Date().toISOString()
  });
});

app.get('/tg/new-token', (req, res) => {
  const token = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  res.json({ ok: true, token });
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Energy888 Socket Server listening on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Process ID: ${process.pid}`);
});

module.exports = app;
