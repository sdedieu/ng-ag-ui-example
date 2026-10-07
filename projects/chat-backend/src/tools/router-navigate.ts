export const ROUTER_NAVIGATE_TOOL = {
  name: 'router_navigate',
  description:
    'Navigate to a different route. There is two different routes: "dashboard" and "settings". "dashboard" should be chosen if user ask to go dashboard or default. "settings" should be chosen if user asks to be bring in its settings',
  parameters: {
    type: 'object',
    properties: {
      route: {
        type: 'string',
        description: 'The route. Prefer dashboard. Only use when asked.',
      },
    },
    required: ['route'],
  },
};
