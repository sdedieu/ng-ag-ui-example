import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  untracked,
} from '@angular/core';
import { MessageStatus, ToolCallMessage } from '../../shared/models/message';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { UserStateService } from '../user-settings/user.state';
import { CreateCampaignStateService } from '../create-campaign/create-campaign.state';

export enum ToolCallName {
  CHANGE_BACKGROUND = 'change_background',
  ROUTER_NAVIGATE = 'router_navigate',
  CHANGE_USER_SETTINGS_FORM_STATE = 'change_user_settings_form_state',
  CHANGE_CREATE_CAMPAIGN_FORM_STATE = 'change_create_campaign_form_state',
  CLICK_ON_ELEMENT = 'click_on_element',
}

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  private readonly _chatService = inject(ChatService);
  private readonly _userStateService = inject(UserStateService);
  private readonly _createCampaignStateService = inject(
    CreateCampaignStateService,
  );
  private readonly _router = inject(Router);

  readonly toolCallMessages: Signal<ToolCallMessage[]> = computed(
    () =>
      this._chatService
        .messages()
        .filter((msg) => msg instanceof ToolCallMessage) as ToolCallMessage[],
  );

  readonly completedCallMessages = computed(() =>
    this.toolCallMessages().filter(
      (msg) => msg.status() === MessageStatus.COMPLETE,
    ),
  );

  readonly changeBackgroundToolMessages = computed(() =>
    this.completedCallMessages().filter(
      (msg) => msg.toolCallName === ToolCallName.CHANGE_BACKGROUND,
    ),
  );

  readonly currentBackground = computed(() => {
    const toolMessages = this.changeBackgroundToolMessages();
    if (toolMessages.length === 0) return 'white';
    const { background } = toolMessages[toolMessages.length - 1].result();
    return background || 'white';
  });

  readonly routerNavigateToolMessages = computed(() =>
    this.completedCallMessages().filter(
      (msg) => msg.toolCallName === ToolCallName.ROUTER_NAVIGATE,
    ),
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

  readonly clickOnElementToolMessages = computed(() =>
    this.completedCallMessages().filter(
      (msg) => msg.toolCallName === ToolCallName.CLICK_ON_ELEMENT,
    ),
  );

  private readonly clickedToolMessages = new WeakSet<ToolCallMessage>();

  clickOnElementEffect = effect(() => {
    for (const message of this.clickOnElementToolMessages()) {
      if (this.clickedToolMessages.has(message)) continue;
      const result = message.result();
      if (!result?.selector) continue;
      const element = document.getElementById(result.selector);
      if (!element) continue;
      this.clickedToolMessages.add(message);
      untracked(() => element.click());
    }
  });

  readonly changeUserSettingsFormStateMessages = computed(() => {
    return this.completedCallMessages().filter(
      (msg) =>
        msg.toolCallName === ToolCallName.CHANGE_USER_SETTINGS_FORM_STATE,
    );
  });

  readonly currentUserSettingsFormState = computed(() => {
    const changeUserSettingsFormStateMessages =
      this.changeUserSettingsFormStateMessages();
    if (changeUserSettingsFormStateMessages.length === 0) return;
    const state =
      changeUserSettingsFormStateMessages[
        changeUserSettingsFormStateMessages.length - 1
      ].result();
    return state;
  });

  userSettingsFormStateEffect = effect(() => {
    const currentFormState = this.currentUserSettingsFormState();
    this._userStateService.set(currentFormState);
  });

  readonly changeCreateCampaignFormStateMessages = computed(() => {
    return this.completedCallMessages().filter(
      (msg) =>
        msg.toolCallName === ToolCallName.CHANGE_CREATE_CAMPAIGN_FORM_STATE,
    );
  });

  readonly currentCreateCampaignFormState = computed(() => {
    const changeCreateCampaignFormStateMessages =
      this.changeCreateCampaignFormStateMessages();
    if (changeCreateCampaignFormStateMessages.length === 0) return;
    const state =
      changeCreateCampaignFormStateMessages[
        changeCreateCampaignFormStateMessages.length - 1
      ].result();
    return state;
  });

  createCampaignFormStateEffect = effect(() => {
    const currentFormState = this.currentCreateCampaignFormState();
    this._createCampaignStateService.set(currentFormState);
  });
}
