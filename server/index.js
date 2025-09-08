import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || '*';
app.use(cors({ origin: FRONT_ORIGIN === '*' ? true : FRONT_ORIGIN }));
app.get('/', (_req, res) => res.json({ ok: true, name: 'energy888-socket-server' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: FRONT_ORIGIN === '*' ? true : FRONT_ORIGIN, methods: ['GET', 'POST'] } });

// In-memory rooms and state
// room: { id, name, creatorId, creatorUsername, creatorProfession, assignProfessionToAll, maxPlayers, password, timing, createdAt, players: Map<username, player> }
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, { players: new Map() });
  return rooms.get(roomId);
}

function listRooms() {
  return Array.from(rooms.values()).map(r => ({
    id: r.id,
    name: r.name || 'Комната',
    creatorId: r.creatorId,
    creatorUsername: r.creatorUsername,
    maxPlayers: r.maxPlayers || 6,
    playersCount: r.players ? r.players.size : 0,
    hasPassword: !!r.password,
    timing: r.timing || 120
  }));
}

io.on('connection', (socket) => {
  // Rooms listing
  socket.on('getRooms', () => {
    socket.emit('roomsList', listRooms());
  });

  // Create room
  socket.on('createRoom', (payload = {}) => {
    const id = payload.id || `room_${Date.now().toString(36)}`;
    if (rooms.has(id)) {
      socket.emit('roomCreateError', { message: 'Комната с таким ID уже существует' });
      return;
    }
    const room = {
      id,
      name: payload.name || 'Комната',
      creatorId: payload.creatorId || socket.id,
      creatorUsername: payload.creatorUsername || 'Игрок',
      creatorProfession: payload.creatorProfession || null,
      creatorDream: payload.creatorDream || null,
      assignProfessionToAll: !!payload.assignProfessionToAll,
      maxPlayers: Number(payload.maxPlayers || 6),
      password: payload.password || null,
      timing: Number(payload.timing || 120),
      createdAt: Date.now(),
      players: new Map()
    };
    rooms.set(id, room);
    socket.emit('roomCreated', { id, ...room, players: [] });
    io.emit('roomsList', listRooms());
  });

  // Join room with metadata
  socket.on('joinRoomMeta', ({ roomId, user, password }) => {
    const room = rooms.get(roomId);
    if (!room) { socket.emit('roomJoinError', { message: 'Комната не найдена' }); return; }
    if (room.password && room.password !== password) { socket.emit('roomJoinError', { message: 'Неверный пароль' }); return; }
    if (room.players.size >= (room.maxPlayers || 6)) { socket.emit('roomJoinError', { message: 'Комната заполнена' }); return; }

    socket.join(roomId);
    const p = {
      id: user?.id || socket.id,
      username: user?.username || `User-${socket.id.slice(0,5)}`,
      socketId: socket.id,
      profession: user?.profession || room.creatorProfession || null,
      balance: Number(user?.balance ?? 3000),
      isHost: room.players.size === 0 && !room.creatorId ? true : (user?.id === room.creatorId)
    };
    room.id = room.id || roomId;
    room.players.set(p.username, p);
    io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    socket.emit('roomJoinedMeta', { roomId, room: { ...room, players: Array.from(room.players.values()) } });
    io.emit('roomsList', listRooms());
  });

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
    io.emit('roomsList', listRooms());
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Socket server listening on', PORT);
});
