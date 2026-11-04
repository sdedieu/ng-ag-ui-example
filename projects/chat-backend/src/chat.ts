import { EventType, RunAgentInputSchema } from '@ag-ui/client';
import { OpenAI } from 'openai';
import type { ResponseInput } from 'openai/resources/responses/responses';
import type { Socket } from 'socket.io';
import { getAgentInstructions } from './agent-context';
import { AgentStep, streamResponse } from './stream-response';
/**  --- step 2 code start --- */
import type { connectTools } from './tools';
/**  --- step 2 code end --- */
/**  --- step 3 code start --- */
import type { connectSharedState } from './shared-state';
/**  --- step 3 code end --- */

interface ChatFeatures {
  /**  --- step 2 code start --- */
  tools?: ReturnType<typeof connectTools>;
  /**  --- step 2 code end --- */
  /**  --- step 3 code start --- */
  state?: ReturnType<typeof connectSharedState>;
  /**  --- step 3 code end --- */
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
        /**  --- step 2 code start --- */
        features.tools?.validate(input);
        /**  --- step 2 code end --- */
        /**  --- step 3 code start --- */
        features.state?.accept(input.state, input.forwardedProps?.stateRevision);
        /**  --- step 3 code end --- */
        threadId = input.threadId;
        socket.emit('event', { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId });
        console.log('📩 User:', message.content);

        const respond = async (messages: ResponseInput, previousResponseId?: string) => {
          /**  --- step 3 code start --- */
          // refresh form context before every model step.
          const state = features.state;
          const stateRevision = state?.revision;
          const context: ResponseInput = state
            ? [{ role: 'user', content: JSON.stringify({ frontendState: state.state }) }] : [];
          /**  --- step 3 code end --- */
          const step = await streamResponse(openai, socket, {
            model: 'gpt-4o',
            instructions: getAgentInstructions(input.forwardedProps?.clientContext, {
              /**  --- step 2 code start --- */
              tools: !!features.tools,
              /**  --- step 2 code end --- */
              /**  --- step 3 code start --- */
              state: !!state,
              /**  --- step 3 code end --- */
            }),
            /**  --- step 3 code start --- */
            input: [...context, ...messages],
            /**  --- step 3 code end --- */
            previous_response_id: previousResponseId,
            store: true,
            stream: true,
            /**  --- step 2 code start --- */
            ...features.tools?.requestOptions(input),
            /**  --- step 2 code end --- */
          });
          /**  --- step 3 code start --- */
          return { ...step, stateRevision };
          /**  --- step 3 code end --- */
        };

        let step: AgentStep = await respond([{ role: 'user', content: message.content }], lastResponseId);
        /**  --- step 2 code start --- */
        // continue the same run until frontend tools finish.
        if (features.tools) step = await features.tools.continueRun(step, respond);
        /**  --- step 2 code end --- */
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
