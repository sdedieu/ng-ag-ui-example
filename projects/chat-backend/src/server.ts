import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { connectChat } from './chat';

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// ✅ Enable CORS
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:4200',
  },
});

io.on('connection', (socket) => {
  console.log('✅ Client connected');
  connectChat(socket);
  socket.on('disconnect', () => console.log('❌ Client disconnected'));
});

httpServer.listen(PORT, () => {
  console.log(
    `✅ WebSocket + OpenAI server running on http://localhost:${PORT}`,
  );
});
