/**  --- step 2 code start --- */
import { inject } from '@angular/core';
import { ToolService } from '../tool.service';
import { CHANGE_BACKGROUND_TOOL } from './change-background';
import { ROUTER_NAVIGATE_TOOL } from './router-navigate';
import { CHANGE_USER_SETTINGS_FORM_STATE_TOOL } from './change-user-settings-form-state';
import { CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL } from './change-create-campaign-form-state';
import { CLICK_ON_ELEMENT_TOOL } from './click-on-element';
import { LOOKUP_CITY_POSTAL_CODE_TOOL } from './lookup-city-postal-code';

export * from './change-background';
export * from './router-navigate';
export * from './change-user-settings-form-state';
export * from './change-create-campaign-form-state';
export * from './click-on-element';
export * from './lookup-city-postal-code';

export function registerAppTools(): void {
  const tools = inject(ToolService);
  tools.register(CHANGE_BACKGROUND_TOOL);
  tools.register(ROUTER_NAVIGATE_TOOL);
  tools.register(CHANGE_USER_SETTINGS_FORM_STATE_TOOL);
  tools.register(CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL);
  tools.register(CLICK_ON_ELEMENT_TOOL);
  tools.register(LOOKUP_CITY_POSTAL_CODE_TOOL);
}
/**  --- step 2 code end --- */
