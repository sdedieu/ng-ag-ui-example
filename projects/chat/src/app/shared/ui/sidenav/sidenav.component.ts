import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sidenav',
  host: {
    class: 'flex min-h-0 flex-1',
  },
  template: `
    <section class="min-w-0 flex-1 overflow-y-auto">
      <ng-content select="[content]" />
    </section>
    <aside class="min-h-0 shrink-0 border-l border-gray-300">
      <ng-content select="[sidenav]" />
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidenav {}
