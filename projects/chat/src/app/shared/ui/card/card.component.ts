import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'card-header',
  host: {
    class: 'flex flex-wrap items-start justify-between gap-6 px-16 pt-16 pb-20',
  },
  template: `
    <div class="min-w-0">
      <ng-content select="[card-description]" />
      <ng-content select="[card-title]" />
    </div>
    <ng-content select="[card-action]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeader {}

@Component({
  selector: '[card-description]',
  host: {
    class: 'block mb-2 text-xs font-extrabold tracking-widest text-emerald-700 uppercase',
  },
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDescription {}

@Component({
  selector: '[card-action]',
  host: {
    class: 'block shrink-0 ml-auto',
  },
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAction {}

@Component({
  selector: '[card-title]',
  host: {
    class: 'block font-bold text-5xl',
  },
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTitle {}

@Component({
  selector: 'card-content',
  host: {
    class: 'block px-16 pb-16',
  },
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContent {}

@Component({
  selector: 'card',
  host: {
    class: 'block h-[48rem] w-full overflow-auto rounded-md shadow-md',
  },
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {}
