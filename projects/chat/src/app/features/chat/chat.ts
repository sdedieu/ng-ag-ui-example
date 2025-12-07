import { Component, effect, inject } from '@angular/core';
import { ChatMessagesContainer } from './chat-messages-container';
import { ChatInput } from './chat-input';
import { ChatService } from './chat.service';

@Component({
  selector: 'chat',
  host: {
    class: 'flex flex-col justify-between p-4 h-screen',
  },
  imports: [ChatMessagesContainer, ChatInput],
  template: `
    <chat-messages-container [messages]="messages()"></chat-messages-container>
    <chat-input
      [(inputValue)]="inputValue"
      (onInputSent)="submitMessage($event)"
      (onCancelSent)="cancelLastMessage()"
      [loading]="loading()"
    ></chat-input>
  `,
})
export class Chat {
  protected inputValue: string = '';

  private readonly _chatService = inject(ChatService);

  readonly messages = this._chatService.messages;
  readonly loading = this._chatService.isLoading;

  submitMessage(content: string): void {
    this.inputValue = '';
    this._chatService.sendMessage(content);
  }

  cancelLastMessage(): void {
    this._chatService.cancelMessage();
  }
}
