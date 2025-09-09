# 🔌 Energy of Money Socket Server

Real-time Socket.IO server for Energy of Money game.

## 🚀 Quick Start

```bash
npm install
npm start
```

## 🔧 Environment Variables

- `NODE_ENV` - production
- `PORT` - Server port (default: 10000)

## 📡 Endpoints

- `GET /` - Server status
- `GET /health` - Health check
- `GET /tg/new-token` - Get Telegram token
- `POST /tg/authorize` - Authorize Telegram user
- `WebSocket /socket.io/` - Socket.IO connection
