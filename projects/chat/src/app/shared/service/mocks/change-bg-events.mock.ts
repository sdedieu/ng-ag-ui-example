import { EventType } from "@ag-ui/client";

export const MOCK_CHANGE_BG_EVENTS: any[] = [
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