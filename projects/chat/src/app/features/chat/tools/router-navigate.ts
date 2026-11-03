import { inject } from '@angular/core';
import { Router } from '@angular/router';

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
  loadingMessage: 'Performing router navigation',
  action: async (args: { route: string }) => {
    const router = inject(Router);
    if (!(await router.navigateByUrl(args.route)) && !router.isActive(args.route, {
      paths: 'exact', queryParams: 'exact', fragment: 'exact', matrixParams: 'exact',
    })) {
      throw new Error('Navigation did not complete');
    }
    return { status: 'success' };
  },
};
