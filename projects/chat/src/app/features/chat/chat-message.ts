import { Component, computed, input } from '@angular/core';
import { ChatMessage as Message } from '../../shared/models/message';

@Component({
  selector: 'chat-message',
  host: {
    class: 'px-3 py-2 mb-2 rounded-md max-w-xs',
    '[class.self-end]': "role() === 'user'",
    '[class.self-start]': "role() === 'assistant'",
    '[class.bg-gray-900]': "role() === 'user'",
    '[class.text-white]': "role() === 'user'",
    '[class.bg-gray-200]': "role() === 'assistant'",
    '[class.text-gray-900]': "role() === 'assistant'",
  },
  template: ` {{ message().content() }} `,
})
export class ChatMessage {
  readonly message = input.required<Message>();

  readonly role = computed(() => this.message().role);
}
