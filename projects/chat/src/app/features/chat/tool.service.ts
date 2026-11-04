
import { computed, inject, Injectable, Injector, runInInjectionContext, signal } from '@angular/core';
import { BaseEvent, EventType, Tool, ToolCallChunkEvent, ToolCallEndEvent } from '@ag-ui/client';

export interface RegisteredTool<TArgs extends object> extends Tool {
  parameters: Record<string, unknown>;
  loadingMessage?: string;
  // Inject dependencies synchronously; return a Promise for asynchronous work.
  action: (args: TArgs) => unknown;
}

// tool registration and execution; independent of the chat transcript.
@Injectable()
export class ToolService {
  private readonly injector = inject(Injector);

  private readonly tools = signal(new Map<string, RegisteredTool<Record<string, unknown>>>());
  private readonly calls = new Map<string, { name: string; args: string }>();
  private readonly activeTool = signal('');

  readonly definitions = computed(() => [...this.tools().values()].map(({ action, loadingMessage, ...definition }) => definition));
  readonly loadingMessage = computed(() => this.tools().get(this.activeTool())?.loadingMessage ?? 'Loading');

  register<TArgs extends object>(tool: RegisteredTool<TArgs>): void {
    if (this.tools().has(tool.name)) throw new Error(`Tool already registered: ${tool.name}`);
    this.tools.update((tools) => new Map(tools).set(tool.name, {
      ...tool,
      action: (args) => tool.action(args as TArgs),
    }));
  }

  async handleEvent(event: BaseEvent, acknowledge?: (result: unknown) => void): Promise<void> {
    if ([EventType.RUN_STARTED, EventType.RUN_FINISHED, EventType.RUN_ERROR].includes(event.type)) {
      this.activeTool.set('');
    }
    if (event.type === EventType.TOOL_CALL_CHUNK) {
      const chunk = event as ToolCallChunkEvent;
      if (!chunk.toolCallId) return;
      const call = this.calls.get(chunk.toolCallId) ?? { name: chunk.toolCallName ?? '', args: '' };
      call.args += chunk.delta ?? '';
      this.calls.set(chunk.toolCallId, call);
      this.activeTool.set(call.name);
    }
    if (event.type === EventType.TOOL_CALL_END && acknowledge) {
      const { toolCallId } = event as ToolCallEndEvent;
      const call = this.calls.get(toolCallId);
      this.calls.delete(toolCallId);
      // The backend awaits this acknowledgement before sending the next tool.
      let result: unknown;
      try {
        const tool = this.tools().get(call?.name ?? '');
        if (!tool || !call) throw new Error('Unknown tool call');
        const args: unknown = JSON.parse(call.args);
        if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Tool arguments must be a JSON object');

        result = await runInInjectionContext(this.injector, () => tool.action(args as Record<string, unknown>));
      } catch (error) {
        result = { status: 'error', message: error instanceof Error ? error.message : 'Tool execution failed' };
      }

      acknowledge(result ?? { status: 'success' });
    }
  }
}
