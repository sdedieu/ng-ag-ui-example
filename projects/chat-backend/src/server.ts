import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import {
  EventType,
  RunAgentInput,
  StateSnapshotEventSchema,
  ToolCallChunkEvent,
} from '@ag-ui/client';
import { Server } from 'socket.io';
import type {
  Response,
  ResponseFunctionToolCall,
  ResponseInput,
} from 'openai/resources/responses/responses';
import {
  CHANGE_BACKGROUND_TOOL,
  ROUTER_NAVIGATE_TOOL,
  CHANGE_USER_SETTINGS_FORM_STATE_TOOL,
  CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL,
  CLICK_ON_ELEMENT_TOOL,
  LOOKUP_CITY_POSTAL_CODE_TOOL,
} from './tools';

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
const MAX_AGENT_STEPS = 10;
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

function createAgentLogger(messageId: string) {
  let textLogged = false;
  const loggedToolCalls = new Set<string>();

  return {
    logText(content: string): void {
      if (textLogged) return;
      console.log('📨 Agent:', {
        type: EventType.TEXT_MESSAGE_CHUNK,
        messageId,
        delta: content,
      });
      textLogged = true;
    },
    logToolCall(toolCall: ResponseFunctionToolCall): void {
      if (loggedToolCalls.has(toolCall.call_id)) return;
      console.log('📨 Agent:', {
        type: EventType.TOOL_CALL_CHUNK,
        parentMessageId: messageId,
        toolCallId: toolCall.call_id,
        toolCallName: toolCall.name,
        delta: toolCall.arguments,
      });
      loggedToolCalls.add(toolCall.call_id);
    },
    logFinished(input: RunAgentInput): void {
      console.log('📨 Agent:', {
        type: EventType.RUN_FINISHED,
        threadId: input.threadId,
        runId: input.runId,
      });
    },
  };
}

io.on('connection', (socket) => {
  console.log('✅ Client connected');
  const threadId = generateUUID();
  let lastResponseId: string | undefined;
  let conversationQueue = Promise.resolve();

  socket.on('state-update', (event: unknown) => {
    console.log('📩 State:', event);
    const result = StateSnapshotEventSchema.safeParse(event);
    if (result.success) {
      // A snapshot replaces the previous state for this connection.
      socket.data.state = { ...socket.data.state, ...result.data.snapshot };
    }
  });

  socket.on('chat-message', (message: Message) => {
    conversationQueue = conversationQueue.then(async () => {
      console.log('📩 User:', message);

      const input: RunAgentInput = {
        threadId,
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
          LOOKUP_CITY_POSTAL_CODE_TOOL,
        ],
        context: [],
      };

      socket.emit('event', {
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      });

      try {
        let responseInput: ResponseInput = input.messages.map((msg) => ({
          role: msg.role as 'user' | 'system' | 'assistant' | 'developer',
          content: (msg.content as string) ?? '',
        }));

        let previousResponseId = lastResponseId;

        for (let step = 0; step < MAX_AGENT_STEPS; step++) {
          const stream = await openai.responses.create({
            model: 'gpt-4o',
            tools: input.tools.map((tool) => ({
              type: 'function',
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters,
              strict: false,
            })),
            input: responseInput,
            previous_response_id: previousResponseId,
            store: true,
            parallel_tool_calls: false,
            stream: true,
          });

          const messageId = generateUUID();
          const logger = createAgentLogger(messageId);
          let response: Response | undefined;
          let hasText = false;

          for await (const event of stream) {
            switch (event.type) {
              case 'response.output_text.delta':
                if (event.delta) {
                  hasText = true;
                  logger.logText(event.delta);
                  socket.emit('event', {
                    type: EventType.TEXT_MESSAGE_CHUNK,
                    messageId,
                    delta: event.delta,
                  });
                }
                break;
              case 'response.output_item.added':
                if (event.item.type === 'function_call') {
                  logger.logToolCall(event.item);
                }
                break;
              case 'response.completed':
                response = event.response;
                break;
              case 'response.failed':
                throw new Error(event.response.error?.message ?? 'Agent response failed');
              case 'response.incomplete':
                throw new Error(`Agent response incomplete: ${event.response.incomplete_details?.reason}`);
              case 'error':
                throw new Error(event.message);
            }
          }

          if (!response || response.status !== 'completed') {
            throw new Error('Agent stream ended without a completed response');
          }

          if (hasText) {
            socket.emit('event', { type: EventType.TEXT_MESSAGE_END, messageId });
          }

          const completedToolCalls = response.output.filter(
            (item) => item.type === 'function_call',
          );
          if (completedToolCalls.length === 0) {
            lastResponseId = response.id;
            logger.logFinished(input);
            socket.emit('event', {
              type: EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId,
            });
            return;
          }

          previousResponseId = response.id;
          responseInput = [];
          for (const toolCall of completedToolCalls) {
            if (!toolCall.call_id || !toolCall.name) {
              throw new Error('Agent returned an incomplete tool call');
            }
            // Deliver complete arguments before asking the frontend to execute.
            socket.emit('event', {
              type: EventType.TOOL_CALL_CHUNK,
              parentMessageId: messageId,
              toolCallId: toolCall.call_id,
              toolCallName: toolCall.name,
              delta: toolCall.arguments,
            } as ToolCallChunkEvent);
            const result = await socket.timeout(30_000).emitWithAck('event', {
              type: EventType.TOOL_CALL_END,
              toolCallId: toolCall.call_id,
            });
            responseInput.push({
              type: 'function_call_output',
              call_id: toolCall.call_id,
              output: JSON.stringify(result ?? null),
            });
          }
        }

        throw new Error(`Agent exceeded the limit of ${MAX_AGENT_STEPS} steps`);
      } catch (error: any) {
        console.error('❌ OpenAI Error:', error);
        socket.emit('event', {
          type: EventType.RUN_ERROR,
          message: error?.message,
        });
      }
    });
    return conversationQueue;
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
