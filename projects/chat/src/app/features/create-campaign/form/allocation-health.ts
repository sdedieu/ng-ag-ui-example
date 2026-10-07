import { CurrencyPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { BudgetChannel } from '../create-campaign.state';

@Component({
  selector: 'allocation-health',
  imports: [CurrencyPipe],
  host: {
    class: 'block rounded-md border border-gray-200 bg-gray-50 p-4',
  },
  template: `
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-gray-500">
          Budget health
        </p>
        <p class="mt-1 text-3xl font-bold text-gray-950">
          {{ totalAllocation() }}%
        </p>
        <p class="text-sm text-gray-600">{{ allocationStatus() }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs font-bold uppercase tracking-widest text-gray-500">
          Planned spend
        </p>
        <p class="mt-1 text-2xl font-semibold text-gray-950">
          {{ plannedSpend() | currency: currency() : 'symbol' : '1.0-0' }}
        </p>
        <p class="text-sm text-gray-600">
          Reserve
          {{ reserveBudget() | currency: currency() : 'symbol' : '1.0-0' }}
        </p>
      </div>
    </div>
    <div class="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
      <div
        class="h-full rounded-full bg-gray-950 transition-all"
        [style.width.%]="progressWidth()"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AllocationHealthComponent {
  readonly totalBudget = input.required<number>();
  readonly currency = input.required<string>();
  readonly reserveBudget = input.required<number>();
  readonly channels = input.required<BudgetChannel[]>();

  totalAllocation(): number {
    return this.channels()
      .filter((channel) => channel.enabled)
      .reduce((total, channel) => total + Number(channel.allocation || 0), 0);
  }

  allocationStatus(): string {
    const delta = 100 - this.totalAllocation();

    if (delta === 0) {
      return 'Every allocatable dollar has an owner.';
    }

    if (delta > 0) {
      return `${delta}% is still unassigned.`;
    }

    return `${Math.abs(delta)}% over budget allocation.`;
  }

  plannedSpend(): number {
    return Math.max(0, this.totalBudget() - this.reserveBudget());
  }

  progressWidth(): number {
    return Math.min(100, Math.max(0, this.totalAllocation()));
  }
}
