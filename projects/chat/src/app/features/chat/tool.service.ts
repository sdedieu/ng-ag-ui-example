import { computed, effect, EffectRef, inject, Injectable, Injector, Signal } from '@angular/core';
import { MessageStatus, ToolCallMessage } from '../../shared/models/message';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { UserStateService } from '../user-settings/user.state';
import { CreateCampaignStateService } from '../create-campaign/create-campaign.state';
import { ApiService } from '../../shared/service/api.service';
import { PostalCodeService } from '../user-settings/postal-code.service';

export enum ToolCallName {
  CHANGE_BACKGROUND = 'change_background',
  ROUTER_NAVIGATE = 'router_navigate',
  CHANGE_USER_SETTINGS_FORM_STATE = 'change_user_settings_form_state',
  CHANGE_CREATE_CAMPAIGN_FORM_STATE = 'change_create_campaign_form_state',
  CLICK_ON_ELEMENT = 'click_on_element',
  LOOKUP_CITY_POSTAL_CODE = 'lookup_city_postal_code',
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
  private readonly _apiService = inject(ApiService);
  private readonly _postalCodeService = inject(PostalCodeService);
  private readonly _injector = inject(Injector);

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

  private readonly executedMessages = new WeakSet<ToolCallMessage>();
  private executionQueue = Promise.resolve();

  readonly executeToolCalls = effect(() => {
    for (const message of this.completedCallMessages()) {
      if (this.executedMessages.has(message)) continue;
      this.executedMessages.add(message);
      this.executionQueue = this.executionQueue.then(async () => {
        let result: unknown;
        try {
          result = await this.executeTool(message);
        } catch (error) {
          result = {
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Tool execution failed',
          };
        }
        if (message.toolCallId) {
          this._apiService.sendToolResult(message.toolCallId, result);
        }
      });
    }
  });

  private async executeTool(message: ToolCallMessage): Promise<unknown> {
    const args = message.result();
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
      throw new Error('Tool arguments must be a JSON object');
    }
    switch (message.toolCallName) {
      case ToolCallName.CHANGE_BACKGROUND:
        // The app derives its background from completed tool messages.
        return { status: 'success' };
      case ToolCallName.ROUTER_NAVIGATE:
        if (
          !(await this._router.navigateByUrl(args.route)) &&
          !this._router.isActive(args.route, {
            paths: 'exact',
            queryParams: 'exact',
            fragment: 'exact',
            matrixParams: 'exact',
          })
        ) {
          throw new Error('Navigation did not complete');
        }
        return { status: 'success' };
      case ToolCallName.LOOKUP_CITY_POSTAL_CODE: {
        this._postalCodeService.lookup(
          args.city, this._userStateService.state().adress,
        );
        const postalCode = this._postalCodeService.postalCodes;
        let watcher: EffectRef | undefined;
        try {
          return await new Promise<unknown>((resolve, reject) => {
            watcher = effect(() => {
              if (postalCode.isLoading()) return;
              if (postalCode.hasValue()) {
                resolve(this._postalCodeService.result());
              } else if (postalCode.error()) {
                reject(new Error('Postal-code lookup is unavailable. Ask the user for the postal code.'));
              }
            }, { injector: this._injector });
          });
        } finally {
          watcher?.destroy();
        }
      }
      case ToolCallName.CHANGE_USER_SETTINGS_FORM_STATE: {
        const state = args.state ?? args;
        if (state.adress?.city !== undefined && !state.adress.zipCode) {
          throw new Error('Look up the city postal code first, then update adress.city and adress.zipCode together.');
        }
        this._userStateService.set(state);
        return { status: 'success' };
      }
      case ToolCallName.CHANGE_CREATE_CAMPAIGN_FORM_STATE: {
        this._createCampaignStateService.set(args);
        const form = this._createCampaignStateService.campaignForm();
        return {
          status: 'success',
          state: this._createCampaignStateService.state(),
          valid: form.valid(),
          errors: form
            .errorSummary()
            .map(({ kind, message }) => ({ kind, message })),
        };
      }
      case ToolCallName.CLICK_ON_ELEMENT: {
        const element = document.getElementById(args.selector);
        if (!element) throw new Error('The requested element was not found');
        element.click();
        return { status: 'success' };
      }
      default:
        throw new Error(`Unknown tool: ${message.toolCallName}`);
    }
  }
}
