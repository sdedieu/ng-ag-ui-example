import { computed, inject, Injectable, Signal, signal } from '@angular/core';

import {
  BaseEvent,
  EventType,
  TextMessageChunkEvent,
  ToolCallChunkEvent,
  RunErrorEvent,
} from '@ag-ui/client';
import {
  ToolCallMessage,
  AssistantMessage,
  UserMessage,
  Message,
  MessageStatus,
} from '../../shared/models/message';
import { ApiService } from '../../shared/service/api.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly _apiService = inject(ApiService);

  private readonly _messages = signal<Message[]>([]);
  readonly messages = this._messages.asReadonly();

  readonly isLastMessageUserAndSending = computed(() => {
    const messages = this.messages();
    return (
      messages.length > 0 &&
      messages[messages.length - 1].role === 'user' &&
      [MessageStatus.SENDING, MessageStatus.SENT].includes(
        messages[messages.length - 1].status()
      )
    );
  });

  readonly isSomeMessageAIAndStreamingButEmpty = computed(() => {
    const messages = this.messages();
    return messages.some(
      (msg) =>
        msg.status() === MessageStatus.STREAMING &&
        ((msg instanceof AssistantMessage && !msg.content()) ||
          (msg instanceof ToolCallMessage && !msg.result()))
    );
  });

  readonly isLoading: Signal<boolean> = computed(() => {
    return (
      this.isLastMessageUserAndSending() ||
      this.isSomeMessageAIAndStreamingButEmpty()
    );
  });

  private toolCallMessage: ToolCallMessage | null = null;
  private assistantMessage: AssistantMessage | null = null;
  private userMessage: UserMessage | null = null;

  constructor() {
    this._apiService.events$.subscribe({
      next: (event: BaseEvent) => {
        switch (event.type) {
          case EventType.RUN_STARTED: {
            break;
          }

          case EventType.TEXT_MESSAGE_CHUNK: {
            const ev = event as TextMessageChunkEvent;
            if (
              !this.assistantMessage ||
              this.assistantMessage.messageId !== ev.messageId
            ) {
              this.assistantMessage = new AssistantMessage(ev);
              this._messages.update((msgs) => [
                ...msgs,
                this.assistantMessage!,
              ]);
            } else
              this.assistantMessage.content.update(
                (content) => content + ev.delta
              );
            break;
          }

          case EventType.TOOL_CALL_CHUNK: {
            const ev = event as ToolCallChunkEvent;
            if (
              !this.toolCallMessage ||
              this.toolCallMessage?.toolCallId !== ev.toolCallId
            ) {
              if (this.toolCallMessage) this.toolCallMessage.complete();
              this.toolCallMessage = new ToolCallMessage(ev);
              this._messages.update((msgs) => [...msgs, this.toolCallMessage!]);
            } else
              this.toolCallMessage.content.update(
                (content) => content + ev.delta
              );
            break;
          }

          case EventType.RUN_FINISHED: {
            this.toolCallMessage?.complete();
            this.toolCallMessage = null;
            this.assistantMessage?.complete();
            this.assistantMessage = null;

            break;
          }

          case EventType.RUN_ERROR: {
            const ev = event as RunErrorEvent;
            console.error('Error from backend:', ev.message);
            break;
          }
        }
      },
    });
  }

  sendMessage(content: string): void {
    this.userMessage = new UserMessage(content);
    this._messages.update((msgs) => [...msgs, this.userMessage!]);

    this._apiService.sendMessage(this.userMessage);
    this.userMessage?.sent();
  }

  cancelMessage(): void {
    this._apiService.cancelMessage();
    this.userMessage?.cancel();
  }
}
