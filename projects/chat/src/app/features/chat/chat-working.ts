import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ChatService } from './chat.service';

import { Loading } from '../../shared/ui/loading/loading';

@Component({
  selector: 'chat-working',
  imports: [Loading],
  template: `@if (isLoading()) {
    <div
      class="absolute top-0 left-0 w-screen h-screen z-100 bg-white/80 flex items-center justify-center"
    >
      <loading [message]="loadingMessage()"/>
    </div>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWorkingComponent {
  private readonly _chatService = inject(ChatService);
  readonly isLoading = this._chatService.isLoading;
  readonly loadingMessage = signal('Loading');

}
