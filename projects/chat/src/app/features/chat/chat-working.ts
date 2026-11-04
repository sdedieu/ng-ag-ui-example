import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ChatService } from './chat.service';
/**  --- step 2 code start --- */
import { ToolService } from './tool.service';
/**  --- step 2 code end --- */
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
  /**  --- step 2 code start --- */
  readonly loadingMessage = inject(ToolService, { optional: true })?.loadingMessage ?? signal('Loading');
  /**  --- step 2 code end --- */
}
