import { inject, Injectable } from '@angular/core';
import { BaseEvent, RunAgentInput } from '@ag-ui/client';
import { Subject } from 'rxjs';
import { UserMessage } from '../models/message';
import { generateUUID } from '../utils/uuid';
import { CHAT_SOCKET } from './chat-socket';
/**  --- step 2 code start --- */
// optional frontend tool support.
import { ToolService } from '../../features/chat/tool.service';
/**  --- step 2 code end --- */
/**  --- step 3 code start --- */
// optional shared state support.
import { ChatStateService } from './chat-state.service';
/**  --- step 3 code end --- */

export { CHAT_SOCKET } from './chat-socket';

@Injectable()
export class ApiService {
  private readonly socket = inject(CHAT_SOCKET);
  private readonly threadId = generateUUID();
  private readonly events = new Subject<BaseEvent>();
  readonly events$ = this.events.asObservable();

  // Remove these optional integrations when teaching lesson 1.
  /**  --- step 2 code start --- */
  private readonly tools = inject(ToolService, { optional: true });
  /**  --- step 2 code end --- */
  /**  --- step 3 code start --- */
  private readonly state = inject(ChatStateService, { optional: true });
  /**  --- step 3 code end --- */

  constructor() {
    this.socket.on('event', (event: BaseEvent, acknowledge?: (result: unknown) => void) => {
      /**  --- step 3 code start --- */
      this.state?.handleEvent(event);
      /**  --- step 3 code end --- */
      /**  --- step 2 code start --- */
      this.tools?.handleEvent(event, acknowledge);
      /**  --- step 2 code end --- */
      this.events.next(event);
    });
  }

  sendMessage(message: UserMessage): void {
    /**  --- step 3 code start --- */
    const state = this.state?.prepareRun();
    /**  --- step 3 code end --- */
    const input: RunAgentInput = {
      threadId: this.threadId,
      runId: generateUUID(),
      messages: [{ id: message.messageId, role: 'user', content: message.content() }],
      context: [],
      /**  --- step 2 code start --- */
      tools: this.tools?.definitions() ?? [],
      /**  --- step 2 code end --- */
      /**  --- step 3 code start --- */
      state: state?.state ?? {},
      /**  --- step 3 code end --- */
      forwardedProps: {
        /**  --- step 3 code start --- */
        stateRevision: state?.stateRevision,
        /**  --- step 3 code end --- */
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
