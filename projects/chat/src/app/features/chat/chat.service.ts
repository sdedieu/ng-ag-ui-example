import { computed, inject, Injectable, signal } from '@angular/core';
import {
  EventType,
  RunErrorEvent,
  TextMessageChunkEvent,
  TextMessageEndEvent,
  ToolCallChunkEvent,
  ToolCallEndEvent,
} from '@ag-ui/client';
import {
  AssistantMessage,
  Message,
  MessageStatus,
  UserMessage,
} from '../../shared/models/message';
import { ToolCallMessage } from '../../shared/models/message';
import { ApiService } from '../../shared/service/api.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(ApiService);
  private readonly history = signal<Message[]>([]);
  private readonly runActive = signal(false);
  private assistant?: AssistantMessage;
  private user?: UserMessage;
  private tool?: ToolCallMessage;

  readonly messages = this.history.asReadonly();
  readonly isLoading = computed(() => {
    const last = this.messages().at(-1);
    return (
      this.runActive() ||
      (last?.role === 'user' &&
        [MessageStatus.SENDING, MessageStatus.SENT].includes(last.status()))
    );
  });

  constructor() {
    this.api.events$.subscribe((event) => {
      switch (event.type) {
        case EventType.RUN_STARTED:
          this.runActive.set(true);
          break;
        case EventType.TOOL_CALL_CHUNK: {
          const chunk = event as ToolCallChunkEvent;
          if (this.tool && this.tool.toolCallId === chunk.toolCallId) {
            this.tool.content.update((text) => text + chunk.delta);
          } else {
            const message = new ToolCallMessage(chunk);
            this.tool = message;
            this.history.update((messages) => [...messages, message]);
          }
          break;
        }
        case EventType.TOOL_CALL_END:
          if (this.tool?.toolCallId === (event as ToolCallEndEvent).toolCallId)
            this.tool.complete();
          break;
        case EventType.TEXT_MESSAGE_CHUNK: {
          const chunk = event as TextMessageChunkEvent;
          if (this.assistant && this.assistant.messageId === chunk.messageId) {
            this.assistant.content.update((text) => text + chunk.delta);
          } else {
            const message = new AssistantMessage(chunk);
            this.assistant = message;
            this.history.update((messages) => [...messages, message]);
          }
          break;
        }
        case EventType.TEXT_MESSAGE_END:
          if (
            this.assistant?.messageId ===
            (event as TextMessageEndEvent).messageId
          )
            this.assistant.complete();
          break;
        case EventType.RUN_FINISHED:
          this.runActive.set(false);
          this.assistant?.complete();
          this.assistant = undefined;
          this.tool?.complete();
          this.tool = undefined;
          break;
        case EventType.RUN_ERROR:
          this.runActive.set(false);
          this.assistant?.error();
          this.assistant = undefined;
          this.user?.status.set(MessageStatus.ERROR);
          this.tool?.error();
          this.tool = undefined;
          console.error((event as RunErrorEvent).message);
          break;
      }
    });
  }

  sendMessage(content: string): void {
    const message = new UserMessage(content);
    this.user = message;
    this.history.update((messages) => [...messages, message]);
    this.api.sendMessage(message);
    message.sent();
  }

  cancelMessage(): void {
    this.api.cancelMessage();
    this.user?.cancel();
  }
}
