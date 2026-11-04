import { randomUUID } from 'crypto';
import { EventType } from '@ag-ui/client';
import { OpenAI } from 'openai';
import type { Response, ResponseCreateParamsStreaming } from 'openai/resources/responses/responses';
import type { Socket } from 'socket.io';

export interface AgentStep {
  response: Response;
  messageId: string;
  /**  --- step 3 code start --- */
  stateRevision?: number;
  /**  --- step 3 code end --- */
}

// Lesson 1: forward text chunks, then return the completed response.
export async function streamResponse(openai: OpenAI, socket: Socket, request: ResponseCreateParamsStreaming): Promise<AgentStep> {
  const stream = await openai.responses.create(request);
  const messageId = randomUUID();
  let hasText = false;

  for await (const event of stream) {
    switch (event.type) {
      case 'response.output_text.delta':
        if (!event.delta) break;
        if (!hasText) console.log('📨 Agent:', event.delta);
        hasText = true;
        socket.emit('event', { type: EventType.TEXT_MESSAGE_CHUNK, messageId, delta: event.delta });
        break;
      case 'response.completed':
        if (hasText) socket.emit('event', { type: EventType.TEXT_MESSAGE_END, messageId });
        return { response: event.response, messageId };
      case 'response.failed':
        throw new Error(event.response.error?.message ?? 'Agent response failed');
      case 'response.incomplete':
        throw new Error(`Agent response incomplete: ${event.response.incomplete_details?.reason}`);
      case 'error':
        throw new Error(event.message);
    }
  }
  throw new Error('Agent stream ended before completion');
}
