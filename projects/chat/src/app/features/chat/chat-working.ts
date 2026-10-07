import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ChatService } from './chat.service';
import { ToolCallName } from './tool.service';
import { Loading } from '../../shared/ui/loading/loading';

@Component({
  selector: 'chat-working',
  imports: [Loading],
  template: `@if (isLoading()) {
    <div
      class="absolute top-0 left-0 w-screen h-screen z-100 bg-white/80 flex items-center justify-center"
    >
      <loading [message]="computedMessage()"/>
    </div>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWorkingComponent {
  private readonly _chatService = inject(ChatService);
  readonly isLoading = this._chatService.isLoading;
  readonly lastToolCallName = this._chatService.lastToolCallName;
  readonly computedMessage = computed(() => {
    const lastToolCallName = this.lastToolCallName();
    switch (lastToolCallName) {
      case ToolCallName.CHANGE_BACKGROUND:
        return 'Changing background color';
      case ToolCallName.ROUTER_NAVIGATE:
        return 'Perfoming router navigation';
      case ToolCallName.CLICK_ON_ELEMENT:
        return 'Interracting with the UI';
      case ToolCallName.CHANGE_USER_SETTINGS_FORM_STATE:
        return 'Adapting user settings';
      case ToolCallName.CHANGE_CREATE_CAMPAIGN_FORM_STATE:
        return 'Adapting campaign creation form';
      default:
        return 'Loading';
    }
  });
}
