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
};
