export const CHANGE_USER_SETTINGS_FORM_STATE_TOOL = {
  name: 'change_user_settings_form_state',
  description: `Change user settings state partially of completely. User settings state has the following properties: firstname, lastname, adress, email, password. Following this type schema:  interface Adress {
            city: string;
            zipCode: string;
          }

          interface UserState {
            firstname: string;
            lastname: string;
            adress: Adress;
            email: string;
            password: string;
          }.
          Important note: user should first redirected to the "settings" route using the "router_navigate" tool.`,
  parameters: {
    type: 'object',
    properties: {
      state: {
        type: 'object',
        description:
          'The state. Only use when asked. Important note: user should first redirected to the "settings" route using the "router_navigate',
      },
    },
    required: ['state'],
  },
};
