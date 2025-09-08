import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Test server is running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    host: HOST
  });
});

app.get('/tg/new-token', (req, res) => {
  const token = `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  res.json({ ok: true, token });
});

app.listen(PORT, HOST, () => {
  console.log(`Test server listening on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
