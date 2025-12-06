import { effect, linkedSignal, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
  const result = { ...target } as any;

  for (const key in patch) {
    if (
      patch[key] !== undefined &&
      typeof patch[key] === 'object' &&
      patch[key] !== null &&
      !Array.isArray(patch[key])
    ) {
      result[key] = deepMerge(target[key], patch[key] as any);
    } else {
      result[key] = patch[key];
    }
  }

  return result;
}

function equal<T extends Record<string, any>>(a: T, b: T): boolean {
  // if (a === b) return true; // handles exact same reference or primitive values
  if (typeof a !== 'object' || a === null) return false;
  if (typeof b !== 'object' || b === null) return false;

  const aKeys = Object.keys(a) as (keyof T)[];
  const bKeys = Object.keys(b) as (keyof T)[];

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => {
    const aVal = a[key];
    const bVal = b[key];

    // if both are objects, recurse
    if (
      typeof aVal === 'object' &&
      aVal !== null &&
      typeof bVal === 'object' &&
      bVal !== null
    ) {
      return equal(aVal, bVal);
    }

    // otherwise primitive comparison
    return aVal === bVal;
  });
}

export abstract class GenricFormStateService<T extends Record<string, any>> {
  protected abstract readonly _state: WritableSignal<T>;

  get state() {
    return this._state.asReadonly();
  }

  set(patch: DeepPartial<T>) {
    this._state.update((s) => deepMerge(s, patch));
  }

  equal<T extends Record<string, any>>(a: T, b: T): boolean {
    return equal(a, b);
  }

  form() {
    const _userSettingsModel = linkedSignal(() => this.state(), {
      equal: this.equal,
    });

    effect(() => {
      const state = _userSettingsModel();
      if (!this.equal(this.state(), state)) this.set(state);
    });

    return form(_userSettingsModel);
  }
}
