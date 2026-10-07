import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'loading',
  template: `
    <div class="flex items-baseline space-x-1 animate-pulse">
      @if (message()) {
        <span>{{ message() }}</span>
      } @else {
        <span class="sr-only">Loading...</span>
      }

      <div
        [class]="size() + ' bg-black rounded-full animate-bounce [animation-delay:-0.3s]'"
      ></div>
      <div
        [class]="size() + ' bg-black rounded-full animate-bounce [animation-delay:-0.15s]'"
      ></div>
      <div [class]="size() + ' bg-black rounded-full animate-bounce'"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  message = input<string>();
  size = computed(() => this.message() ? 'h-1 w-1' : 'h-2 w-2')
}
