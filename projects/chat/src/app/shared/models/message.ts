import { TextMessageChunkEvent, ToolCallChunkEvent } from '@ag-ui/client';
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
export type ToolCallMessageStatus = AssistantMessageStatus;

export interface Message {
  content: WritableSignal<string>;
  role: 'user' | 'assistant' | 'tool';
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
  readonly role!: 'assistant' | 'tool';
  messageId!: string;
  readonly status: WritableSignal<AssistantMessageStatus>;
  readonly isDone = computed(() =>
    [
      MessageStatus.COMPLETE,
      MessageStatus.ERROR,
      MessageStatus.CANCELLED,
    ].includes(this.status())
  );

  constructor(readonly event: TextMessageChunkEvent | ToolCallChunkEvent) {
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

export class ToolCallMessage extends AIMessage {
  override readonly role: 'tool';
  readonly toolCallId: string | undefined;
  readonly toolCallName: string | undefined;
  readonly result = computed(() => {
    if (!this.isDone()) return null;
    try {
      return JSON.parse(this.content());
    } catch {
      return null;
    }
  });

  constructor(override readonly event: ToolCallChunkEvent) {
    super(event);
    this.role = 'tool';
    this.messageId = event.parentMessageId ?? generateUUID();
    this.toolCallId = event?.toolCallId;
    this.toolCallName = event?.toolCallName;
  }
}
