import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../shared/ui/button/button';

const speechErrors: Record<string, string> = {
  'not-allowed': 'Microphone access was denied. Allow it in your browser settings and try again.',
  'service-not-allowed': 'Speech recognition is not available in this browser. You can still type your message.',
  'audio-capture': 'No microphone is available. Check your microphone connection and try again.',
  'no-speech': 'No speech was detected. Please try again.',
  network: 'Speech recognition could not connect. Check your connection and try again.',
  'language-not-supported': 'Your browser does not support dictation in this language.',
};

@Component({
  selector: 'chat-input',
  host: {
    class:
      'flex flex-col shrink-0 p-0 m-4 justify-between items-center border-1 rounded-md border-gray-300 bg-white',
  },
  imports: [FormsModule, Button],
  template: `
    <textarea
      class="focus:outline-none flex-1 p-4 resize-none field-sizing-content w-96 max-h-[7lh] overflow-y-auto"
      [(ngModel)]="inputValue"
      (keyup.enter)="submitMessage()"
      aria-label="Chat message"
      placeholder="Type your message..."
    ></textarea>
    @if (listening()) {
      <p role="status" class="w-full px-4 text-sm text-gray-600 truncate">
        {{ interimTranscript() || 'Listening… Speak, then stop to review your message.' }}
      </p>
    }
    @if (speechError()) {
      <p role="alert" class="w-full px-4 text-sm text-red-700">{{ speechError() }}</p>
    }
    <div class="flex justify-end items-center gap-4 w-full px-4 pb-4 pt-2">
      <button
        type="button"
        class="mr-auto flex items-center gap-2"
        [color]="listening() ? 'primary' : 'secondary'"
        [disabled]="!speechSupported || loading()"
        [attr.aria-pressed]="listening()"
        [attr.aria-label]="!speechSupported ? 'Dictation unavailable in this browser' : listening() ? 'Stop dictation' : 'Dictate a message'"
        [title]="speechSupported ? 'Dictate using your browser language' : 'Speech recognition is not supported in this browser'"
        (click)="toggleDictation()"
        data-test="chat-dictation"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
        </svg>
        {{ listening() ? 'Stop' : 'Dictate' }}
      </button>
      @if (loading()) {
        <button (click)="cancelAction()" color="secondary">
          <svg
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
          (click)="submitMessage()"
          color="primary"
          [disabled]="!trimedInputValue() || loading() || listening()"
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInput {
  private readonly speechRecognition = typeof window === 'undefined'
    ? undefined : window.SpeechRecognition ?? window.webkitSpeechRecognition;
  private recognition?: SpeechRecognition;

  readonly speechSupported = !!this.speechRecognition;
  readonly listening = signal(false);
  readonly interimTranscript = signal('');
  readonly speechError = signal('');
  readonly inputValue = model.required<string>();
  readonly trimedInputValue = computed(() => this.inputValue()?.trim());
  readonly loading = input<boolean>(false);

  readonly onInputSent = output<string>();
  readonly onCancelSent = output<void>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.recognition?.abort();
      this.recognition = undefined;
    });
  }

  toggleDictation(): void {
    if (this.recognition) {
      this.recognition.stop();
      return;
    }
    if (!this.speechRecognition || this.loading()) return;

    const recognition = this.recognition = new this.speechRecognition();
    recognition.lang = navigator.language;
    recognition.continuous = true;
    recognition.interimResults = true;
    this.speechError.set('');
    this.interimTranscript.set('');

    recognition.onresult = ({ results, resultIndex }) => {
      if (this.recognition !== recognition) return;
      let interim = '';
      for (let index = 0; index < results.length; index++) {
        const result = results[index];
        const transcript = result[0].transcript.trim();
        if (result.isFinal && index >= resultIndex) {
          this.inputValue.update((value) => [value.trimEnd(), transcript].filter(Boolean).join(' '));
        } else if (!result.isFinal) {
          interim += transcript + ' ';
        }
      }
      this.interimTranscript.set(interim.trim());
    };
    recognition.onerror = ({ error }) => {
      if (this.recognition !== recognition || error === 'aborted') return;
      this.speechError.set(speechErrors[error] ?? 'Dictation failed. Please try again or type your message.');
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      this.recognition = undefined;
      this.listening.set(false);
      this.interimTranscript.set('');
    };

    try {
      recognition.start();
      this.listening.set(true);
    } catch {
      this.recognition = undefined;
      this.speechError.set('Could not start dictation. Please try again.');
    }
  }

  submitMessage() {
    if (this.loading() || this.listening()) return;
    const content = this.trimedInputValue();
    if (content) {
      this.onInputSent.emit(content);
      this.inputValue.set('');
    }
  }

  cancelAction() {
    this.onCancelSent.emit();
  }
}
