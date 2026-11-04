import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { connectChat } from './chat';

import { connectTools } from './tools';

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

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
  connectChat(socket, openai, {

    tools: connectTools(socket),        // remove this line for chat only.

  });
  socket.on('disconnect', () => console.log('❌ Client disconnected'));
});

httpServer.listen(PORT, () => {
  console.log(`✅ WebSocket + OpenAI server running on http://localhost:${PORT}`);
});
