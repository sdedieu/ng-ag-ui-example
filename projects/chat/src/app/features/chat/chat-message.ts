import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Message, MessageStatus } from '../../shared/models/message';
import { Loading } from '../../shared/ui/loading/loading';

@Component({
  selector: 'chat-message',
  host: {
    class: 'px-3 py-2 mb-2 rounded-md max-w-xs',
    '[class.self-end]': '!isAI()',
    '[class.self-start]': 'isAI()',
    '[class.bg-gray-900]': '!isAI()',
    '[class.text-white]': '!isAI()',
    '[class.bg-gray-200]': 'isAI()',
    '[class.text-gray-900]': 'isAI()',
  },
  template: `
    @if (role() === 'assistant' || role() === 'user') {
      {{ message().content() }}
    }
    @if (isLoading()) {
      <loading />
    }
  `,
  imports: [Loading],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessage {
  readonly message = input.required<Message>();

  readonly role = computed(() => this.message().role);

  readonly isAI = computed(() => this.role() === 'assistant');

  readonly isEmptyAssistant = computed(
    () => this.role() === 'assistant' && !this.message().content(),
  );

  readonly isLoading = this.isEmptyAssistant;
}
