import { Component, effect, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'chat-input',
  host: {
    class:
      'flex gap-4 p-4 justify-between items-center border-1 rounded-md mt-4 border-gray-300 bg-white',
  },
  imports: [FormsModule],
  template: `
    <input
      class="focus:outline-none flex-1 p-2"
      [(ngModel)]="inputValue"
      (keyup.enter)="submitMessage()"
      placeholder="Type your message..."
    />
    @if(loading()) {

    <button
      class="p-1 border-1 border-transparent rounded-md bg-gray-100 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      (click)="cancelAction()"
    >
      <svg
        class="w-6 h-6 text-gray-800 dark:text-white"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        class="size-4"
      >
        <rect
          width="18"
          height="18"
          x="3"
          y="3"
          stroke="currentColor"
          stroke-linejoin="round"
          stroke-width="2"
          rx="1"
        />
      </svg>
    </button>

    } @else {
    <button
      class="p-1 border-1 rounded-md bg-gray-900 text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      (click)="submitMessage()"
      [disabled]="loading()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
        />
      </svg>
    </button>
    }
  `,
})
export class ChatInput {
  readonly inputValue = model.required<string>();
  readonly loading = input<boolean>(false);

  ef = effect(() => {
    console.log('loading', this.loading());
  });

  readonly onInputSent = output<string>();
  readonly onCancelSent = output<void>();

  submitMessage() {
    if (this.loading()) return;
    const content = this.inputValue().trim();
    if (content) {
      this.onInputSent.emit(content);
      this.inputValue.set('');
    }
  }

  cancelAction() {
    this.onCancelSent.emit();
  }
}
