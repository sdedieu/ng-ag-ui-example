import { computed, effect, inject, Injectable, Signal } from '@angular/core';
import { ToolCallMessage } from '../../shared/models/message';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { UserStateService } from '../user-settings/user.state';

export enum ToolCallName {
  CHANGE_BACKGROUND = 'change_background',
  ROUTER_NAVIGATE = 'router_navigate',
  CHANGE_FORM_STATE = 'change_form_state',
}

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private readonly _chatService = inject(ChatService);
  private readonly _userStateService = inject(UserStateService);
  private readonly _router = inject(Router);

  readonly toolCallMessages: Signal<ToolCallMessage[]> = computed(
    () =>
      this._chatService
        .messages()
        .filter(
          (msg) => msg instanceof ToolCallMessage && msg.isCompleted()
        ) as ToolCallMessage[]
  );

  readonly changeBackgroundToolMessages = computed(() =>
    this.toolCallMessages().filter(
      (msg) => msg.toolCallName === ToolCallName.CHANGE_BACKGROUND
    )
  );

  readonly currentBackground = computed(() => {
    const toolMessages = this.changeBackgroundToolMessages();
    if (toolMessages.length === 0) return 'white';
    const { background } = toolMessages[toolMessages.length - 1].result();
    return background || 'white';
  });

  readonly routerNavigateToolMessages = computed(() =>
    this.toolCallMessages().filter(
      (msg) => msg.toolCallName === ToolCallName.ROUTER_NAVIGATE
    )
  );

  readonly currentRoute = computed(() => {
    const routerNavigateToolMessages = this.routerNavigateToolMessages();
    if (routerNavigateToolMessages.length === 0) return;
    const { route } =
      routerNavigateToolMessages[
        routerNavigateToolMessages.length - 1
      ].result();
    return route;
  });

  routerNavigateEffect = effect(() => {
    const route = this.currentRoute();
    return this._router.navigateByUrl(route);
  });

  readonly changeFormStateMessages = computed(() => {
    return this.toolCallMessages().filter(
      (msg) => msg.toolCallName === ToolCallName.CHANGE_FORM_STATE
    );
  });

  readonly currentFormState = computed(() => {
    const changeFormStateMessages = this.changeFormStateMessages();
    if (changeFormStateMessages.length === 0) return;
    const state =
      changeFormStateMessages[changeFormStateMessages.length - 1].result();
    return state;
  });

  formStateEffect = effect(() => {
    const currentFormState = this.currentFormState();
    console.log('currentFormState', currentFormState);
    this._userStateService.set(currentFormState);
  });
}
