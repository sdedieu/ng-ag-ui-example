/**  --- step 3 code start --- */
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BaseEvent, CustomEvent, EventType, StateSnapshotEventSchema, StateDeltaEventSchema } from '@ag-ui/client';
import { applyPatch, compare } from 'fast-json-patch';
import { CHAT_SOCKET } from './chat-socket';

// state synchronization is opt-in through app.config.ts.
@Injectable()
export class ChatStateService {
  private readonly socket = inject(CHAT_SOCKET);
  private readonly stateSources = signal(new Map<string, () => unknown>());
  private readonly readState = computed(() => Object.fromEntries(
    [...this.stateSources()].map(([name, read]) => [name, read()]),
  ));
  private sharedState: Record<string, unknown> = {};
  private stateSent = false;
  private revision = 0;
  private readonly toolVersions = new Map<string, number>();
  private readonly receivedState = signal<Record<string, unknown>>({});
  // The backend's accepted state. Form sources remain authoritative for editable drafts.
  readonly agentState = this.receivedState.asReadonly();
  private awaitingSnapshot = true;
  private snapshotRequested = false;
  private readonly syncState = effect(() => this.publishState(this.readState()));

  constructor() {
    this.socket.on('connect', () => {
      this.awaitingSnapshot = true;
      this.snapshotRequested = false;
      this.publishState(this.readState(), true);
    });
    this.socket.on('request-frontend-state', () => this.publishState(this.readState(), true));
  }

  prepareRun() {
    this.flush();
    return { state: this.sharedState, stateRevision: this.revision };
  }

  flush(): void {
    this.publishState(this.readState());
  }

  handleEvent(event: BaseEvent): void {
    this.receiveState(event);
    if (event.type === EventType.CUSTOM) {
      const { name, value } = event as CustomEvent;
      if (name === 'tool-state-version' && value && typeof value.toolCallId === 'string' && Number.isSafeInteger(value.revision)) {
        this.toolVersions.set(value.toolCallId, value.revision);
      }
    }
  }

  // ponytail: reject the whole call on any form change; use per-field versions if retries become disruptive.
  assertToolStateCurrent(toolCallId: string): void {
    // Read synchronously: an input event may have preceded Angular's IO effect.
    this.publishState(this.readState());
    const expected = this.toolVersions.get(toolCallId);
    this.toolVersions.delete(toolCallId);
    if (expected !== this.revision) {
      throw new Error('Frontend state changed after this tool was planned. Reconsider the request using the latest state; preserve manual edits.');
    }
  }

  private receiveState(event: BaseEvent): void {
    if (event.type !== EventType.STATE_SNAPSHOT && event.type !== EventType.STATE_DELTA) return;
    try {
      if (event.type === EventType.STATE_SNAPSHOT) {
        const { snapshot } = StateSnapshotEventSchema.parse(event);
        if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('Invalid state');
        this.receivedState.set(snapshot);
        this.awaitingSnapshot = false;
        this.snapshotRequested = false;
      } else {
        if (this.awaitingSnapshot) throw new Error('Missing state baseline');
        const { delta } = StateDeltaEventSchema.parse(event);
        const next: unknown = applyPatch(this.receivedState(), delta, true, false).newDocument;
        if (!next || typeof next !== 'object' || Array.isArray(next)) throw new Error('Invalid state');
        this.receivedState.set(next as Record<string, unknown>);
      }
    } catch {
      this.awaitingSnapshot = true;
      if (!this.snapshotRequested) {
        this.snapshotRequested = true;
        this.socket.emit('request-state-snapshot');
      }
    }
  }

  registerStateSource(name: string, read: () => unknown): void {
    if (this.stateSources().has(name)) throw new Error(`State source already registered: ${name}`);
    this.stateSources.set(new Map(this.stateSources()).set(name, read));
  }

  private publishState(state: Record<string, unknown>, snapshot = false): void {
    // Match JSON's wire representation, including empty numeric fields (NaN → null).
    const next: Record<string, unknown> = JSON.parse(JSON.stringify(state));
    const delta = compare(this.sharedState, next);
    const baseRevision = this.revision;
    if (delta.length) this.revision++;
    this.sharedState = next;
    if (!this.socket.connected) {
      this.stateSent = false;
      return;
    }
    if (snapshot || !this.stateSent) {
      this.socket.emit('frontend-state', { state: next, revision: this.revision });
      this.stateSent = true;
    } else if (delta.length) {
      this.socket.emit('frontend-state', { delta, baseRevision, revision: this.revision });
    }
  }
}
/**  --- step 3 code end --- */
