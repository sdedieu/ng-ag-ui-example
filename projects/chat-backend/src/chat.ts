import { EventType, RunAgentInputSchema } from '@ag-ui/client';
import { OpenAI } from 'openai';
import type { ResponseInput } from 'openai/resources/responses/responses';
import type { Socket } from 'socket.io';
import { getAgentInstructions } from './agent-context';
import { AgentStep, streamResponse } from './stream-response';
import type { connectTools } from './tools';
import type { connectSharedState } from './shared-state';

interface ChatFeatures {
  tools?: ReturnType<typeof connectTools>;
  state?: ReturnType<typeof connectSharedState>;
}

// Lesson 1 owns run boundaries, text streaming, and conversation continuity.
export function connectChat(socket: Socket, openai: OpenAI, features: ChatFeatures = {}) {
  let threadId: string | undefined;
  let lastResponseId: string | undefined;
  let conversationQueue = Promise.resolve();

  socket.on('run-agent', (request: unknown) => {
    conversationQueue = conversationQueue.then(async () => {
      try {
        const input = RunAgentInputSchema.parse(request);
        const message = input.messages[0];
        if (threadId && threadId !== input.threadId) throw new Error('Unexpected conversation thread');
        if (input.messages.length !== 1 || message.role !== 'user' || typeof message.content !== 'string') {
          throw new Error('Expected one new user message');
        }
        features.tools?.validate(input);
        features.state?.accept(input.state, input.forwardedProps?.stateRevision);
        threadId = input.threadId;
        socket.emit('event', { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId });
        console.log('📩 User:', message.content);

        const respond = async (messages: ResponseInput, previousResponseId?: string) => {
          // refresh form context before every model step.
          const state = features.state;
          const stateRevision = state?.revision;
          const context: ResponseInput = state
            ? [{ role: 'user', content: JSON.stringify({ frontendState: state.state }) }] : [];
          const step = await streamResponse(openai, socket, {
            model: 'gpt-4o',
            instructions: getAgentInstructions(input.forwardedProps?.clientContext, {
              tools: !!features.tools,
              state: !!state,
            }),
            input: [...context, ...messages],
            previous_response_id: previousResponseId,
            store: true,
            stream: true,
            ...features.tools?.requestOptions(input),
          });
          return { ...step, stateRevision };
        };

        let step: AgentStep = await respond([{ role: 'user', content: message.content }], lastResponseId);
        // continue the same run until frontend tools finish.
        if (features.tools) step = await features.tools.continueRun(step, respond);
        lastResponseId = step.response.id;
        const finished = { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId };
        console.log('📨 Agent:', finished);
        socket.emit('event', finished);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Agent run failed';
        socket.emit('event', { type: EventType.RUN_ERROR, message });
      }
    });
    return conversationQueue;
  });
}
