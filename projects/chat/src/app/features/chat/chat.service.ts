import { computed, Injectable, Signal, signal } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import {
  BaseEvent,
  EventType,
  TextMessageChunkEvent,
  ToolCallChunkEvent,
  RunErrorEvent,
} from '@ag-ui/client';
import { environment } from '../../../environments/environment';
import {
  ToolCallMessage,
  AssistantMessage,
  UserMessage,
  Message,
  ChatMessage,
} from '../../shared/models/message';

@Injectable()
export class ChatService {
  private socket: Socket;

  private readonly _messages = signal<Message[]>([]);
  readonly messages = this._messages.asReadonly();

  readonly chatMessages = computed(
    () =>
      this.messages().filter(
        (msg) => msg.role === 'assistant' || msg.role === 'user'
      ) as ChatMessage[]
  );

  readonly toolCallMessages: Signal<ToolCallMessage[]> = computed(
    () =>
      this.messages().filter(
        (msg) => msg instanceof ToolCallMessage && msg.isCompleted()
      ) as ToolCallMessage[]
  );

  readonly isLoading = signal(false);

  private toolCallMessage: ToolCallMessage | null = null;
  private assistantMessage: Message | null = null;

  constructor() {
    console.log('ChatService loaded');
    this.socket = io(environment.apiUrl);

    this.socket.on('event', (event: BaseEvent) => {
      console.log('backend call:', JSON.stringify(event));
      switch (event.type) {
        case EventType.RUN_STARTED: {
          this.isLoading.set(true);
          break;
        }

        case EventType.TEXT_MESSAGE_CHUNK: {
          const ev = event as TextMessageChunkEvent;
          if (
            !this.assistantMessage ||
            this.assistantMessage.messageId !== ev.messageId
          ) {
            this.assistantMessage = new AssistantMessage(ev);
            this._messages.update((msgs) => [...msgs, this.assistantMessage!]);
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
          if (this.toolCallMessage) {
            this.toolCallMessage.complete();
            this.toolCallMessage = null;
          }
          this.isLoading.set(false);
          break;
        }

        case EventType.RUN_ERROR: {
          const ev = event as RunErrorEvent;
          console.error('Error from backend:', ev.message);
          break;
        }
      }
    });
  }

  sendMessage(content: string): void {
    const userMessage = new UserMessage(content);
    this._messages.update((msgs) => [...msgs, userMessage]);

    this.socket.emit('chat-message', {
      ...userMessage,
      content: content,
    });
  }
}
