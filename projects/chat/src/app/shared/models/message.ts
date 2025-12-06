import { TextMessageChunkEvent, ToolCallChunkEvent } from '@ag-ui/client';
import { computed, signal, WritableSignal } from '@angular/core';
import { generateUUID } from '../utils/uuid';

export interface Message {
  content: WritableSignal<string>;
  role: 'user' | 'assistant' | 'tool';
  messageId: string;
}

export interface ChatMessage extends Message {
  role: 'user' | 'assistant';
}

export class UserMessage implements ChatMessage {
  readonly content: WritableSignal<string>;
  readonly role: 'user';
  readonly messageId: string;

  constructor(content: string) {
    this.content = signal<string>(content);
    this.role = 'user';
    this.messageId = generateUUID();
  }
}

export class AssistantMessage implements Message {
  readonly content: WritableSignal<string>;
  readonly role: 'assistant';
  readonly messageId: string;

  constructor(private readonly toolCallEvent: TextMessageChunkEvent) {
    this.content = signal<string>(toolCallEvent?.delta ?? '');
    this.role = 'assistant';
    this.messageId = toolCallEvent.messageId ?? generateUUID();
  }
}

export class ToolCallMessage implements Message {
  readonly content: WritableSignal<string>;
  readonly role: 'tool';
  readonly messageId: string;
  readonly toolCallId: string | undefined;
  readonly toolCallName: string | undefined;
  readonly result = computed(() => {
    if (!this.isCompleted()) return null;
    try {
      return JSON.parse(this.content());
    } catch {
      return null;
    }
  });

  private readonly _completed = signal<boolean>(false);
  readonly isCompleted = this._completed.asReadonly();

  constructor(private readonly toolCallEvent: ToolCallChunkEvent) {
    this.content = signal<string | any>(toolCallEvent?.delta ?? '');
    this.role = 'tool';
    this.messageId = toolCallEvent.parentMessageId ?? generateUUID();
    this.toolCallId = toolCallEvent.toolCallId;
    this.toolCallName = toolCallEvent.toolCallName;
  }

  complete(): void {
    this._completed.set(true);
  }
}
