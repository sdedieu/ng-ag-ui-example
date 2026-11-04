/**  --- step 2 code start --- */
import { EventType, RunAgentInput } from '@ag-ui/client';
import type { ResponseInput } from 'openai/resources/responses/responses';
import type { Socket } from 'socket.io';
import type { AgentStep } from './stream-response';

type Respond = (messages: ResponseInput, previousResponseId?: string) => Promise<AgentStep>;
const MAX_AGENT_STEPS = 10;

// tool schemas, frontend execution, and continuation after tool results.
export function connectTools(socket: Socket) {
  function validate(input: RunAgentInput): void {
    if (new Set(input.tools.map((tool) => tool.name)).size !== input.tools.length ||
      !input.tools.every((tool) => /^[a-zA-Z0-9_-]{1,64}$/.test(tool.name) &&
        tool.parameters && typeof tool.parameters === 'object' && !Array.isArray(tool.parameters))) {
      throw new Error('Invalid or duplicate tool definitions');
    }
  }

  function requestOptions(input: RunAgentInput) {
    return {
      tools: input.tools.map((tool) => ({
        type: 'function' as const, name: tool.name, description: tool.description,
        parameters: tool.parameters, strict: false,
      })),
      parallel_tool_calls: false,
    };
  }

  async function continueRun(first: AgentStep, respond: Respond): Promise<AgentStep> {
    let step = first;
    for (let index = 0; ; index++) {
      const calls = step.response.output.filter((item) => item.type === 'function_call');
      if (!calls.length) return step;
      if (index === MAX_AGENT_STEPS - 1) throw new Error(`Agent exceeded the limit of ${MAX_AGENT_STEPS} steps`);
      const results: ResponseInput = [];
      for (const call of calls) {
        console.log('📨 Agent:', { tool: call.name, arguments: call.arguments });
        /**  --- step 3 code start --- */
        // only present when shared state support is connected.
        if (step.stateRevision !== undefined) socket.emit('event', {
          type: EventType.CUSTOM, name: 'tool-state-version',
          value: { toolCallId: call.call_id, revision: step.stateRevision },
        });
        /**  --- step 3 code end --- */
        socket.emit('event', {
          type: EventType.TOOL_CALL_CHUNK, parentMessageId: step.messageId,
          toolCallId: call.call_id, toolCallName: call.name, delta: call.arguments,
        });
        const result = await socket.timeout(30_000).emitWithAck('event', {
          type: EventType.TOOL_CALL_END, toolCallId: call.call_id,
        });
        results.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result ?? null) });
      }
      step = await respond(results, step.response.id);
    }
  }

  return { validate, requestOptions, continueRun };
}
/**  --- step 2 code end --- */
