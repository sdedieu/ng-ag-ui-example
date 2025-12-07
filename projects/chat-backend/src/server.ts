import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { generate } from 'rxjs';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import {
  AbstractAgent,
  BaseEvent,
  EventType,
  RunAgentInput,
  RunFinishedEvent,
  RunStartedEvent,
  TextMessageChunkEvent,
  ToolCallChunkEvent,
  RunErrorEvent,
  TextMessageStartEvent,
  TextMessageEndEvent,
} from '@ag-ui/client';
import { Server } from 'socket.io';

// ✅ Load environment variables
dotenv.config();

export interface Message {
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
  })
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
        {
          name: 'change_background',
          description:
            'Change the background color of the chat. Can be anything that the CSS background attribute accepts. Regular colors, linear of radial gradients etc.',
          parameters: {
            type: 'object',
            properties: {
              background: {
                type: 'string',
                description:
                  'The background. Prefer gradients. Only use when asked.',
              },
            },
            required: ['background'],
          },
        },
        {
          name: 'router_navigate',
          description:
            'Navigate to a different route. There is two different routes: "home" and "settings". "home" should be chosen if user ask to go home or default. "settings" should be chosen if user asks to be bring in its settings',
          parameters: {
            type: 'object',
            properties: {
              route: {
                type: 'string',
                description: 'The route. Prefer home. Only use when asked.',
              },
            },
            required: ['route'],
          },
        },
        {
          name: 'change_form_state',
          description: `Change user settings state partially of completely. User settings state has the following properties: firstname, lastname, adress, email, password. Following this type schema:  interface Adress {
            city: string;
            zipCode: string;
          }

          interface UserState {
            firstname: string;
            lastname: string;
            adress: Adress;
            email: string;
            password: string;
          }.
          Important note: user should first redirected to the "settings" route using the "router_navigate" tool.`,
          parameters: {
            type: 'object',
            properties: {
              state: {
                type: 'object',
                description:
                  'The state. Only use when asked. Important note: user should first redirected to the "settings" route using the "router_navigate',
              },
            },
            required: ['state'],
          },
        },
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
    `✅ WebSocket + OpenAI server running on http://localhost:${PORT}`
  );
});
