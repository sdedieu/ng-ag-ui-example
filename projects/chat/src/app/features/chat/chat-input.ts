import { Component, model, output } from '@angular/core';
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
    <button
      class="p-1 border-1 rounded-md bg-gray-900 text-white"
      (click)="submitMessage()"
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
  `,
})
export class ChatInput {
  readonly inputValue = model.required<string>();

  readonly onInputSent = output<string>();

  submitMessage() {
    const content = this.inputValue().trim();
    if (content) {
      this.onInputSent.emit(content);
      this.inputValue.set('');
    }
  }
}
