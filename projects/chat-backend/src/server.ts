import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import {
  EventType,
  RunAgentInput,
  ToolCallChunkEvent,
} from '@ag-ui/client';
import { Server } from 'socket.io';
import {
  CHANGE_BACKGROUND_TOOL,
  ROUTER_NAVIGATE_TOOL,
  CHANGE_USER_SETTINGS_FORM_STATE_TOOL,
  CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL,
  CLICK_ON_ELEMENT_TOOL,
} from './tools';

// ✅ Load environment variables
dotenv.config();

interface Message {
  content: string;
  role: 'user' | 'assistant';
  messageId: string;
}

export function generateUUID(): string {
  return `${new Date().getTime().toString()}${Math.random()
    .toString(36)
    .substring(2)}`;
}

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
  socket.on('chat-message', async (message: Message) => {
    console.log('📩 User:', message);

    const input: RunAgentInput = {
      threadId: generateUUID(),
      runId: generateUUID(),
      messages: [
        {
          content: message.content,
          role: message.role,
          id: message.messageId,
        },
      ],
      tools: [
        CHANGE_BACKGROUND_TOOL,
        ROUTER_NAVIGATE_TOOL,
        CHANGE_USER_SETTINGS_FORM_STATE_TOOL,
        CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL,
        CLICK_ON_ELEMENT_TOOL,
      ],
      context: [],
    };

    socket.emit('event', {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    });

    try {
      const completions = await openai.chat.completions.create({
        model: 'gpt-4o',
        tools: input.tools.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        messages: input.messages.map((msg) => ({
          role: msg.role as 'user' | 'system' | 'assistant' | 'developer',
          content: (msg.content as string) ?? '',
        })),
        stream: true,
      });

      const messageId = generateUUID();
      let toolCallId: string | undefined = undefined;

      for await (const chunk of completions) {
        const content = chunk.choices[0]?.delta?.content;
        const toolCalls = chunk.choices[0]?.delta?.tool_calls;

        if (content) {
          // ✅ Stream each content to Angular
          socket.emit('event', {
            type: EventType.TEXT_MESSAGE_CHUNK,
            messageId,
            delta: chunk.choices[0]?.delta?.content || '',
          });
        } else if (toolCalls) {
          console.log(
            '📦 Tools call:',
            toolCalls.map((tc) => tc.function?.name).join(', '),
          );
          const toolCall = toolCalls[0];
          if (toolCall?.id) toolCallId = toolCall.id;
          socket.emit('event', {
            type: EventType.TOOL_CALL_CHUNK,
            parentMessageId: messageId,
            toolCallId,
            toolCallName: toolCall?.function?.name,
            delta: toolCall.function?.arguments,
          } as ToolCallChunkEvent);
        }
      }

      // ✅ Signal stream complete
      socket.emit('event', {
        type: EventType.RUN_FINISHED,
        threadId: input.threadId,
        runId: input.runId,
      });
    } catch (error: any) {
      console.error('❌ OpenAI Error:', error);
      socket.emit('event', {
        type: EventType.RUN_ERROR,
        message: error?.message,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `✅ WebSocket + OpenAI server running on http://localhost:${PORT}`,
  );
});
