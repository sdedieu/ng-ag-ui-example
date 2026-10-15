import { CHANGE_BACKGROUND_TOOL } from './change-background';
import { ROUTER_NAVIGATE_TOOL } from './router-navigate';
import { CHANGE_USER_SETTINGS_FORM_STATE_TOOL } from './change-user-settings-form-state';
import { CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL } from './change-create-campaign-form-state';
import { CLICK_ON_ELEMENT_TOOL } from './click-on-element';

export * from './change-background';
export * from './router-navigate';
export * from './change-user-settings-form-state';
export * from './change-create-campaign-form-state';
export * from './click-on-element';

export const tools = [
  CHANGE_BACKGROUND_TOOL,
  ROUTER_NAVIGATE_TOOL,
  CHANGE_USER_SETTINGS_FORM_STATE_TOOL,
  CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL,
  CLICK_ON_ELEMENT_TOOL,
].map((tool) => ({ type: 'function' as const, function: tool }));
