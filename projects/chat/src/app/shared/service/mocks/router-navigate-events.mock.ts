
import { EventType } from '@ag-ui/client';

export const MOCK_ROUTER_NAVIGATE_EVENTS = [
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