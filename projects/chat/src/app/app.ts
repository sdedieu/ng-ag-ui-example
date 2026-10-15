import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Sidenav } from './shared/ui/sidenav/sidenav.component';
import { ToolService } from './features/chat/tool.service';
import { Chat } from './features/chat/chat';
import { PageLayout } from './shared/components/page-layout';
import { ChatWorkingComponent } from './features/chat/chat-working';

@Component({
  selector: 'app-root',
  host: {
    class: 'flex h-dvh flex-col overflow-hidden',
    '[style.background]': 'background()',
  },
  imports: [Chat, Sidenav, PageLayout, ChatWorkingComponent],
  template: `
    <chat-working />
    <sidenav>
      <page-layout content />
      <chat sidenav />
    </sidenav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly _toolService = inject(ToolService);
  readonly background = this._toolService.currentBackground;
}
