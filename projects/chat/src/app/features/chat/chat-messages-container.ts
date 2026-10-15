import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ChatMessage } from './chat-message';
import { Message } from '../../shared/models/message';

@Component({
  selector: 'chat-messages-container',
  host: {
    class: 'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain rounded-md bg-white p-4',
  },
  imports: [ChatMessage],
  template: `
    @for (message of messages(); track message.messageId) {
      <chat-message [message]="message"> </chat-message>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessagesContainer {
  readonly messages = input<Message[]>([]);
}
