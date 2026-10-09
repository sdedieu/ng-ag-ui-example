import { Injectable } from '@angular/core';

import { io, Socket } from 'socket.io-client';
import { BaseEvent, EventType, ToolCallEndEvent } from '@ag-ui/client';
import { environment } from '../../../environments/environment';
import { UserMessage } from '../../shared/models/message';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  private socket: Socket = io(environment.apiUrl);
  private readonly toolResults = new Map<string, (result: unknown) => void>();

  readonly events$ = new Observable<BaseEvent>((subscriber) => {
    const onEvent = (
      event: BaseEvent,
      acknowledge?: (result: unknown) => void,
    ) => {
      if (event.type === EventType.TOOL_CALL_END && acknowledge) {
        this.toolResults.set(
          (event as ToolCallEndEvent).toolCallId,
          acknowledge,
        );
      }
      subscriber.next(event);
    };
    this.socket.on('event', onEvent);
    return () => this.socket.off('event', onEvent);
  });

  sendToolResult(toolCallId: string, result: unknown): void {
    const acknowledge = this.toolResults.get(toolCallId);
    this.toolResults.delete(toolCallId);
    acknowledge?.(result);
  }

  sendMessage(userMessage: UserMessage): void {
    this.socket.emit('chat-message', {
      ...userMessage,
      content: userMessage.content(),
    });
  }

  cancelMessage(): void {
    this.socket.emit('chat-cancel-message');
  }
}
