import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Message, MessageStatus } from '../../shared/models/message';
import { Loading } from '../../shared/ui/loading/loading';
import { MarkdownComponent } from 'ngx-markdown';

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
    '[class.hidden]': 'isToolComplete()',
  },
  template: `
    @if (role() === 'assistant' || role() === 'user') {
      <markdown
        class="prose prose-sm block max-w-none overflow-x-auto wrap-anywhere"
        [class.prose-invert]="role() === 'user'"
        [data]="message().content()"
      ></markdown>
    }
    @if (isLoading()) {
      <loading />
    }
  `,
  imports: [Loading, MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessage {
  readonly message = input.required<Message>();

  readonly role = computed(() => this.message().role);

  readonly isAI = computed(() => ['assistant', 'tool'].includes(this.role()));

  readonly isEmptyAssistant = computed(
    () => this.role() === 'assistant' && !this.message().content(),
  );

  readonly isStreamingTool = computed(
    () =>
      this.role() === 'tool' &&
      this.message().status() === MessageStatus.STREAMING,
  );

  readonly isToolComplete = computed(
    () =>
      this.role() === 'tool' &&
      this.message().status() === MessageStatus.COMPLETE,
  );

  readonly isLoading = computed(
    () => this.isEmptyAssistant() || this.isStreamingTool(),
  );
}
