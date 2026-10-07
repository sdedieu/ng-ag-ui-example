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
};
