import { Component, input } from '@angular/core';
import { ChatMessage } from './chat-message';
import { ChatMessage as Message } from '../../shared/models/message';

@Component({
  selector: 'chat-messages-container',
  host: { class: 'p-4 grow-1 flex flex-col rounded-md bg-white' },
  imports: [ChatMessage],
  template: `
    @for(message of messages(); track message.messageId) {
    <chat-message [message]="message"></chat-message>
    }
  `,
})
export class ChatMessagesContainer {
  readonly messages = input<Message[]>([]);
}
