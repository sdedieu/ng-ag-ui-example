import { TextMessageChunkEvent } from '@ag-ui/client';
import { computed, signal, WritableSignal } from '@angular/core';
import { generateUUID } from '../utils/uuid';

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  STREAMING = 'streaming',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

export type UserMessageStatus = Exclude<
  MessageStatus,
  MessageStatus.STREAMING | MessageStatus.COMPLETE
>;

export type AssistantMessageStatus = Exclude<
  MessageStatus,
  MessageStatus.SENDING | MessageStatus.SENT
>;

export interface Message {
  content: WritableSignal<string>;
  role: 'user' | 'assistant';
  messageId: string;
  status: WritableSignal<MessageStatus>;
}

export class UserMessage implements Message {
  readonly content: WritableSignal<string>;
  readonly role: 'user';
  readonly messageId: string;
  readonly status: WritableSignal<UserMessageStatus>;

  constructor(content: string) {
    this.content = signal<string>(content);
    this.role = 'user';
    this.messageId = generateUUID();
    this.status = signal<UserMessageStatus>(MessageStatus.SENDING);
  }

  sent(): void {
    this.status.set(MessageStatus.SENT);
  }
  cancel(): void {
    this.status.set(MessageStatus.CANCELLED);
  }
}

export class AIMessage implements Message {
  readonly content: WritableSignal<string>;
  readonly role!: 'assistant';
  messageId!: string;
  readonly status: WritableSignal<AssistantMessageStatus>;
  readonly isDone = computed(() =>
    [
      MessageStatus.COMPLETE,
      MessageStatus.ERROR,
      MessageStatus.CANCELLED,
    ].includes(this.status()),
  );

  constructor(readonly event: TextMessageChunkEvent) {
    this.content = signal<string>(event?.delta ?? '');
    this.status = signal<AssistantMessageStatus>(MessageStatus.STREAMING);
  }

  complete(): void {
    this.status.set(MessageStatus.COMPLETE);
  }
  cancel(): void {
    this.status.set(MessageStatus.CANCELLED);
  }
  error(): void {
    this.status.set(MessageStatus.ERROR);
  }
}

export class AssistantMessage extends AIMessage {
  override readonly role: 'assistant';

  constructor(override readonly event: TextMessageChunkEvent) {
    super(event);
    this.role = 'assistant';
    this.messageId = event.messageId ?? generateUUID();
  }
}
