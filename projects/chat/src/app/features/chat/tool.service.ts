import { computed, effect, inject, Injectable, Injector, runInInjectionContext, signal } from '@angular/core';
import type { Tool } from '@ag-ui/client';
import { MessageStatus, ToolCallMessage } from '../../shared/models/message';
import { ChatService } from './chat.service';
import { ApiService } from '../../shared/service/api.service';

export interface RegisteredTool<TArgs extends object> extends Tool {
  parameters: Record<string, unknown>;
  loadingMessage?: string;
  // Inject dependencies synchronously; return a Promise for asynchronous work.
  action: (args: TArgs) => unknown;
}

@Injectable({ providedIn: 'root' })
export class ToolService {
  private readonly chat = inject(ChatService);
  private readonly api = inject(ApiService);
  private readonly injector = inject(Injector);
  private readonly tools = signal(new Map<string, {
    definition: Tool;
    loadingMessage?: string;
    action: (args: Record<string, unknown>) => unknown;
  }>());

  readonly loadingMessage = computed(() =>
    this.tools().get(this.chat.lastToolCallName() ?? '')?.loadingMessage ?? 'Loading',
  );

  register<TArgs extends object>(tool: RegisteredTool<TArgs>): void {
    if (this.tools().has(tool.name)) throw new Error(`Tool already registered: ${tool.name}`);
    const { action, loadingMessage, ...definition } = tool;
    const tools = new Map(this.tools());
    tools.set(tool.name, {
      definition,
      loadingMessage,
      action: (args) => action(args as TArgs),
    });
    this.tools.set(tools);
    this.api.setTools([...tools.values()].map((entry) => entry.definition));
  }

  private readonly completedCallMessages = computed(() =>
    this.chat.messages().filter((message): message is ToolCallMessage =>
      message instanceof ToolCallMessage && message.status() === MessageStatus.COMPLETE,
    ),
  );

  private readonly executedMessages = new WeakSet<ToolCallMessage>();
  private executionQueue = Promise.resolve();

  readonly executeToolCalls = effect(() => {
    for (const message of this.completedCallMessages()) {
      if (this.executedMessages.has(message)) continue;
      this.executedMessages.add(message);
      this.executionQueue = this.executionQueue.then(async () => {
        let result: unknown;
        try {
          result = await this.executeTool(message);
        } catch (error) {
          result = {
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Tool execution failed',
          };
        }
        if (message.toolCallId) {
          this.api.sendToolResult(message.toolCallId, result);
        }
      });
    }
  });

  private async executeTool(message: ToolCallMessage): Promise<unknown> {
    const args: unknown = message.result();
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw new Error('Tool arguments must be a JSON object');
    }
    const tool = this.tools().get(message.toolCallName ?? '');
    if (!tool) throw new Error(`Unknown tool: ${message.toolCallName}`);
    const result = await runInInjectionContext(this.injector, () =>
      tool.action(args as Record<string, unknown>),
    );
    return result ?? { status: 'success' };
  }
}
