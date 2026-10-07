import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'chip',
  host: {
    class:
      'block text-center px-2 py-1 min-w-12 border-1 rounded-full border-transparent',
    '[class.bg-green-100]': 'color() === "success"',
    '[class.text-green-800]': 'color() === "success"',
    '[class.bg-red-100]': 'color() === "danger"',
    '[class.text-red-800]': 'color() === "danger"',
  },
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  color = input.required<'success' | 'danger'>();
}
