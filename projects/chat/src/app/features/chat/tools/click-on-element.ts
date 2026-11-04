
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

export const CLICK_ON_ELEMENT_TOOL = {
  name: 'click_on_element',
  description:
    'Click on an element in the page. The element is selected using the element id as selector. Only use when asked.',
  parameters: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'The element id to click.',
      },
    },
    required: ['selector'],
  },
  loadingMessage: 'Interacting with the UI',
  action: (args: { selector: string }) => {
    const element = inject(DOCUMENT).getElementById(args.selector);
    if (!element) throw new Error('The requested element was not found');
    element.click();
    return { status: 'success' };
  },
};
