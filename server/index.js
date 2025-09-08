import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.get('/', (_req, res) => res.json({ ok: true, name: 'energy888-socket-server' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// In-memory room state
const rooms = new Map(); // roomId -> { players: Map<username, { id, username, socketId, balance }> }

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { players: new Map() });
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId, player) => {
    try {
      const room = getRoom(roomId);
      socket.join(roomId);
      const user = {
        id: player?.id || socket.id,
        username: player?.username || `User-${socket.id.slice(0,5)}`,
        socketId: socket.id,
        balance: Number(player?.balance ?? 3000)
      };
      room.players.set(user.username, user);
      io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    } catch (e) {
      // ignore
    }
  });

  socket.on('bankTransfer', (payload) => {
    try {
      const { roomId, username, recipient, amount = 0, currentBalance = 0, transactionId } = payload || {};
      const room = getRoom(roomId);
      const sender = room.players.get(username) || { username, balance: currentBalance, socketId: socket.id };
      const amt = Number(amount) || 0;
      if (amt <= 0) return;

      // Update balances
      const newBalance = Number(sender.balance ?? currentBalance) - amt;
      if (newBalance < 0) {
        socket.emit('bankTransferError', { message: 'Недостаточно средств' });
        return;
      }
      sender.balance = newBalance;
      room.players.set(sender.username, sender);

      // Recipient
      const rec = room.players.get(recipient);
      if (rec) {
        rec.balance = Number(rec.balance ?? 0) + amt;
        room.players.set(recipient, rec);
        io.to(rec.socketId).emit('bankTransferReceived', { fromPlayer: sender.username, amount: amt });
      } else {
        // Broadcast receive event (fallback)
        socket.to(roomId).emit('bankTransferReceived', { fromPlayer: sender.username, amount: amt });
      }

      // Notify sender success
      socket.emit('bankTransferSuccess', { message: 'Перевод выполнен', newBalance, transactionId });

      // Emit updated players list
      io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    } catch (e) {
      socket.emit('bankTransferError', { message: 'Ошибка перевода' });
    }
  });

  socket.on('disconnect', () => {
    // Clean up user from rooms
    rooms.forEach((room, roomId) => {
      for (const [username, u] of room.players) {
        if (u.socketId === socket.id) {
          room.players.delete(username);
        }
      }
      io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Socket server listening on', PORT);
});

