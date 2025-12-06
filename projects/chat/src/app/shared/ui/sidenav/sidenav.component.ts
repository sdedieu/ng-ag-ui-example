import { Component } from '@angular/core';

@Component({
  selector: 'sidenav',
  host: {
    class: 'flex',
  },
  template: `
    <section class="grow">
      <ng-content select="[content]" />
    </section>
    <aside class="border-l border-gray-300">
      <ng-content select="[sidenav]" />
    </aside>
  `,
})
export class Sidenav {}
