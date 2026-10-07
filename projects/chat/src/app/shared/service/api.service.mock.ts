import { Injectable } from '@angular/core';

import {
  debounceTime,
  interval,
  map,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { UserMessage } from '../models/message';
import {
  MOCK_CHANGE_BG_EVENTS,
  MOCK_CHANGE_CAMPAIGN_CREATION_FORM_STATE_MESSAGES,
  MOCK_CHANGE_USER_EMAIL_MESSAGES,
  MOCK_CHANGE_USER_TOWN_MESSAGES,
  MOCK_ROUTER_NAVIGATE_EVENTS,
} from './mocks';

@Injectable()
export class ApiServiceMock {
  private caller$ = new Subject<string>();
  private canceller$ = new Subject<void>();

  readonly events$ = this.caller$.pipe(
    debounceTime(1000),
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
        })),
      ),
    ),
    takeUntil(this.canceller$),
  );

  sendMessage(userMessage: UserMessage): void {
    const content = userMessage.content();
    this.caller$.next(content);
  }

  cancelMessage(): void {
    this.canceller$.next();
  }

  private loadRightMock(message: string) {
    if (['bg', 'background'].find((key) => message.includes(key)))
      return MOCK_CHANGE_BG_EVENTS;
    else if (
      ['navigate', 'get me', 'bring me', 'send me'].find((key) =>
        message.includes(key),
      )
    )
      return MOCK_ROUTER_NAVIGATE_EVENTS;
    else if (['town', 'city'].find((key) => message.includes(key)))
      return MOCK_CHANGE_USER_TOWN_MESSAGES;
    else if (['email'].find((key) => message.includes(key)))
      return MOCK_CHANGE_USER_EMAIL_MESSAGES;

    return MOCK_CHANGE_CAMPAIGN_CREATION_FORM_STATE_MESSAGES;
  }
}
