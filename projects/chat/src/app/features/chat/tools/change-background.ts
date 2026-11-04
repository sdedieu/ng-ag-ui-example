
import { inject } from '@angular/core';
import { AppearanceService } from '../../../shared/service/appearance.service';

export const CHANGE_BACKGROUND_TOOL = {
  name: 'change_background',
  description:
    'Change the background color of the chat. Can be anything that the CSS background attribute accepts. Regular colors, linear of radial gradients etc.',
  parameters: {
    type: 'object',
    properties: {
      background: {
        type: 'string',
        description: 'The background. Prefer gradients. Only use when asked.',
      },
    },
    required: ['background'],
  },
  loadingMessage: 'Changing background color',
  action: (args: { background: string }) => {
    inject(AppearanceService).background.set(args.background);
    return { status: 'success' };
  },
};
