import { Component, inject } from '@angular/core';
import { Sidenav } from './shared/ui/sidenav/sidenav.component';
import { ToolService } from './features/chat/tool.service';
import { Chat } from './features/chat/chat';
import { PageLayout } from './shared/components/page-layout';

@Component({
  selector: 'app-root',
  host: {
    class: 'flex flex-col justify-between min-h-screen',
    '[style.background]': 'background()',
  },
  imports: [Chat, Sidenav, PageLayout],
  template: `
    <sidenav>
      <page-layout content />
      <chat sidenav />
    </sidenav>
  `,
})
export class App {
  private readonly _toolService = inject(ToolService);
  readonly background = this._toolService.currentBackground;
}
