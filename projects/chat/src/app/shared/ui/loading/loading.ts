import { Component } from '@angular/core';

@Component({
  selector: 'loading',
  template: `
    <div class="flex items-center space-x-1">
      <span class="sr-only">Loading...</span>

      <div
        class="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"
      ></div>
      <div
        class="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"
      ></div>
      <div class="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
  `,
})
export class Loading {}
