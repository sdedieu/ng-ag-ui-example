const MOCK_CHANGE_BG_EVENTS: any[] = [
  {
    type: EventType.RUN_STARTED,
    threadId: '1765013536111quk0pdy93cm',
    runId: '1765013536111fwyf4vd3009',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765013537792qmuu90xdsz',
    toolCallId: 'call_7eWXbWnBPg2HgHnp2ULcVuGE',
    toolCallName: 'change_background',
    delta: '',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765013537792qmuu90xdsz',
    toolCallId: 'call_7eWXbWnBPg2HgHnp2ULcVuGE',
    delta: '{"',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765013537792qmuu90xdsz',
    toolCallId: 'call_7eWXbWnBPg2HgHnp2ULcVuGE',
    delta: 'background',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765013537792qmuu90xdsz',
    toolCallId: 'call_7eWXbWnBPg2HgHnp2ULcVuGE',
    delta: '":"',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765013537792qmuu90xdsz',
    toolCallId: 'call_7eWXbWnBPg2HgHnp2ULcVuGE',
    delta: '__param__',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765013537792qmuu90xdsz',
    toolCallId: 'call_7eWXbWnBPg2HgHnp2ULcVuGE',
    delta: '"}',
  },
  {
    type: EventType.RUN_FINISHED,
    threadId: '1765013536111quk0pdy93cm',
    runId: '1765013536111fwyf4vd3009',
  },
];

const MOCK_ROUTER_NAVIGATE_EVENTS = [
  {
    type: EventType.RUN_STARTED,
    threadId: '17650210171117g40hbzw7aw',
    runId: '1765021017111iqi0pxkht1j',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '17650210176586x4d027bqzg',
    toolCallId: 'call_LKtZnxXNHwwfWLyUs7jMcEqT',
    toolCallName: 'router_navigate',
    delta: '',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '17650210176586x4d027bqzg',
    toolCallId: 'call_LKtZnxXNHwwfWLyUs7jMcEqT',
    delta: '{"',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '17650210176586x4d027bqzg',
    toolCallId: 'call_LKtZnxXNHwwfWLyUs7jMcEqT',
    delta: 'route',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '17650210176586x4d027bqzg',
    toolCallId: 'call_LKtZnxXNHwwfWLyUs7jMcEqT',
    delta: '":"',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '17650210176586x4d027bqzg',
    toolCallId: 'call_LKtZnxXNHwwfWLyUs7jMcEqT',
    delta: '__param__',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '17650210176586x4d027bqzg',
    toolCallId: 'call_LKtZnxXNHwwfWLyUs7jMcEqT',
    delta: '"}',
  },
  {
    type: EventType.RUN_FINISHED,
    threadId: '17650210171117g40hbzw7aw',
    runId: '1765021017111iqi0pxkht1j',
  },
];

const MOCK_CHANGE_USER_EMAIL_MESSAGES = [
  {
    type: EventType.RUN_STARTED,
    threadId: '1765034994603np7qyqei7hr',
    runId: '1765034994603gzrabhvp59r',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_6W3SNaAbhpwbPoAgAe2Nccni',
    toolCallName: 'router_navigate',
    delta: '',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_6W3SNaAbhpwbPoAgAe2Nccni',
    delta: '{"ro',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_6W3SNaAbhpwbPoAgAe2Nccni',
    delta: 'ute":',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_6W3SNaAbhpwbPoAgAe2Nccni',
    delta: ' "sett',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_6W3SNaAbhpwbPoAgAe2Nccni',
    delta: 'ings',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_6W3SNaAbhpwbPoAgAe2Nccni',
    delta: '"}',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    toolCallName: 'change_form_state',
    delta: '',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    delta: '{"em',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    delta: 'ail":',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    delta: ' "toto',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    delta: '@gma',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    delta: 'il.co',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765034996694z9cm82m1fml',
    toolCallId: 'call_Bp54q92kIQAbSBVp7WVyusl3',
    delta: 'm"}',
  },
  {
    type: EventType.RUN_FINISHED,
    threadId: '1765034994603np7qyqei7hr',
    runId: '1765034994603gzrabhvp59r',
  },
];

const MOCK_CHANGE_USER_TOWN_MESSAGES = [
  {
    type: EventType.RUN_STARTED,
    threadId: '17650360000613bpuoawi5vu',
    runId: '1765036000061x28u5qpo2kb',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_rDKgCpviQancPUVfE7OOurOS',
    toolCallName: 'router_navigate',
    delta: '',
  },

  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_rDKgCpviQancPUVfE7OOurOS',
    delta: '{"ro',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_rDKgCpviQancPUVfE7OOurOS',
    delta: 'ute":',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_rDKgCpviQancPUVfE7OOurOS',
    delta: ' "sett',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_rDKgCpviQancPUVfE7OOurOS',
    delta: 'ings',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_rDKgCpviQancPUVfE7OOurOS',
    delta: '"}',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    toolCallName: 'change_form_state',
    delta: '',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    delta: '{"ad',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    delta: 'ress"',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    delta: ': {"ci',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    delta: 'ty":',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    delta: ' "Par',
  },
  {
    type: EventType.TOOL_CALL_CHUNK,
    parentMessageId: '1765036001038nop48n6ulz8',
    toolCallId: 'call_AmIdkKUiifnu5qg873alA5d6',
    delta: 'is"}}',
  },
  {
    type: EventType.RUN_FINISHED,
    threadId: '17650360000613bpuoawi5vu',
    runId: '1765036000061x28u5qpo2kb',
  },
];

import { computed, Injectable, Signal, signal } from '@angular/core';

import { interval, map, Subject, switchMap, take, takeWhile, tap } from 'rxjs';
import {
  BaseEvent,
  EventType,
  TextMessageChunkEvent,
  ToolCallChunkEvent,
  RunErrorEvent,
} from '@ag-ui/client';
import {
  ToolCallMessage,
  AssistantMessage,
  UserMessage,
  Message,
} from '../../shared/models/message';

@Injectable()
export class ChatServiceMock {
  readonly messages = signal<Message[]>([]);

  readonly chatMessages = computed(() =>
    this.messages().filter(
      (msg) => msg.role === 'user' || msg.role === 'assistant'
    )
  );

  readonly toolCallMessages: Signal<ToolCallMessage[]> = computed(
    () =>
      this.messages().filter(
        (msg) => msg instanceof ToolCallMessage && msg.isCompleted()
      ) as ToolCallMessage[]
  );

  readonly isLoading = signal(false);

  private toolCallMessage: ToolCallMessage | null = null;
  private assistantMessage: Message | null = null;

  private caller$ = new Subject<string>();

  private socketMock = this.caller$.pipe(
    map((message) => ({
      param: message.split(' ').slice(-1)[0],
      mocks: this.loadRightMock(message),
    })),
    switchMap(({ param, mocks }) =>
      interval(10).pipe(
        takeWhile((_, index) => index < mocks.length),
        map((i) => ({
          ...mocks[i],
          ...(mocks[i].delta
            ? {
                delta: mocks[i].delta?.replace('__param__', param),
              }
            : {}),
        }))
      )
    )
  );

  constructor() {
    console.log('ChatServiceMock loaded');
    this.socketMock.subscribe((event: BaseEvent) => {
      switch (event.type) {
        case EventType.RUN_STARTED: {
          this.isLoading.set(true);
          break;
        }

        case EventType.TEXT_MESSAGE_CHUNK: {
          const ev = event as TextMessageChunkEvent;
          if (
            !this.assistantMessage ||
            this.assistantMessage.messageId !== ev.messageId
          ) {
            this.assistantMessage = new AssistantMessage(ev);
            this.messages.update((msgs) => [...msgs, this.assistantMessage!]);
          } else
            this.assistantMessage.content.update(
              (content) => content + ev.delta
            );
          break;
        }

        case EventType.TOOL_CALL_CHUNK: {
          const ev = event as ToolCallChunkEvent;
          if (
            !this.toolCallMessage ||
            this.toolCallMessage?.toolCallId !== ev.toolCallId
          ) {
            if (this.toolCallMessage) this.toolCallMessage.complete();
            this.toolCallMessage = new ToolCallMessage(ev);
            this.messages.update((msgs) => [...msgs, this.toolCallMessage!]);
          } else
            this.toolCallMessage.content.update(
              (content) => content + ev.delta
            );
          break;
        }

        case EventType.RUN_FINISHED: {
          if (this.toolCallMessage) {
            this.toolCallMessage.complete();
            this.toolCallMessage = null;
          }
          this.isLoading.set(false);
          break;
        }

        case EventType.RUN_ERROR: {
          const ev = event as RunErrorEvent;
          console.error('Error from backend:', ev.message);
          break;
        }
      }
    });
  }

  sendMessage(content: string): void {
    const userMessage = new UserMessage(content);
    this.messages.update((msgs) => [...msgs, userMessage]);

    this.caller$.next(content);
  }

  private loadRightMock(message: string) {
    if (['bg', 'background'].find((key) => message.includes(key)))
      return MOCK_CHANGE_BG_EVENTS;
    else if (
      ['navigate', 'get me', 'bring me', 'send me'].find((key) =>
        message.includes(key)
      )
    )
      return MOCK_ROUTER_NAVIGATE_EVENTS;

    return MOCK_CHANGE_USER_TOWN_MESSAGES;
  }
}
