import { inject, Injectable } from '@angular/core';
import { BaseEvent, RunAgentInput } from '@ag-ui/client';
import { Subject } from 'rxjs';
import { UserMessage } from '../models/message';
import { generateUUID } from '../utils/uuid';
import { CHAT_SOCKET } from './chat-socket';

// optional frontend tool support.
import { ToolService } from '../../features/chat/tool.service';

export { CHAT_SOCKET } from './chat-socket';

@Injectable()
export class ApiService {
  private readonly socket = inject(CHAT_SOCKET);
  private readonly threadId = generateUUID();
  private readonly events = new Subject<BaseEvent>();
  readonly events$ = this.events.asObservable();


  private readonly tools = inject(ToolService, { optional: true });

  constructor() {
    this.socket.on('event', (event: BaseEvent, acknowledge?: (result: unknown) => void) => {

      this.tools?.handleEvent(event, acknowledge);

      this.events.next(event);
    });
  }

  sendMessage(message: UserMessage): void {

    const input: RunAgentInput = {
      threadId: this.threadId,
      runId: generateUUID(),
      messages: [{ id: message.messageId, role: 'user', content: message.content() }],
      context: [],
      state: {},

      tools: this.tools?.definitions() ?? [],

      forwardedProps: {

        clientContext: {
          currentDate: new Date().toLocaleDateString('en-CA'),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    };
    this.socket.emit('run-agent', input);
  }

  cancelMessage(): void {
    this.socket.emit('chat-cancel-message');
  }
}
