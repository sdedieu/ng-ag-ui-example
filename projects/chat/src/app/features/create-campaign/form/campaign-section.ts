import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'campaign-section',
  host: {
    class: 'block rounded-md border border-gray-200 bg-white p-5',
  },
  template: `
    <div class="mb-5 flex flex-col gap-1">
      <p class="text-xs font-bold uppercase tracking-widest text-gray-500">
        {{ eyebrow() }}
      </p>
      <h3 class="text-2xl font-bold text-gray-950">{{ title() }}</h3>
      @if (description()) {
        <p class="text-sm text-gray-600">{{ description() }}</p>
      }
    </div>
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignSectionComponent {
  readonly eyebrow = input('Planning');
  readonly title = input.required<string>();
  readonly description = input('');
}
