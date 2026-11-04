import { EventType, StateDeltaEventSchema } from '@ag-ui/client';
import { applyPatch, compare } from 'fast-json-patch';
import type { Socket } from 'socket.io';

function isState(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

// versioned frontend edits become AG-UI snapshots and deltas.
export function connectSharedState(socket: Socket) {
  let state: Record<string, unknown> = {};
  let revision = -1;
  let published = false;

  function snapshot() {
    socket.emit('event', { type: EventType.STATE_SNAPSHOT, snapshot: state });
    published = true;
  }

  function accept(next: unknown, version: unknown): void {
    if (!isState(next) || !Number.isSafeInteger(version) || (version as number) < 0) {
      throw new Error('Invalid frontend state or revision');
    }
    if ((version as number) < revision) return; // A queued run must not undo newer manual edits.
    const delta = compare(state, next);
    if (version === revision && delta.length) throw new Error('Conflicting state revision');
    state = next;
    revision = version as number;
    if (!published) snapshot();
    else if (delta.length) socket.emit('event', { type: EventType.STATE_DELTA, delta });
  }

  socket.on('frontend-state', (update: unknown) => {
    try {
      if (!update || typeof update !== 'object') throw new Error('Invalid update');
      if ('state' in update && 'revision' in update) {
        accept(update.state, update.revision);
      } else if ('delta' in update && 'baseRevision' in update && 'revision' in update) {
        if (update.baseRevision !== revision || typeof update.revision !== 'number' || update.revision <= revision) {
          throw new Error('State baseline mismatch');
        }
        const { delta } = StateDeltaEventSchema.parse({ type: EventType.STATE_DELTA, delta: update.delta });
        accept(applyPatch(state, delta, true, false).newDocument, update.revision);
      } else throw new Error('Missing state');
    } catch {
      socket.emit('request-frontend-state');
    }
  });
  socket.on('request-state-snapshot', snapshot);

  return { get state() { return state; }, get revision() { return revision; }, accept };
}
