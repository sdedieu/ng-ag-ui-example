import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'card',
  host: {
    class: 'block rounded-md shadow-md px-16 py-16',
  },
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {}
