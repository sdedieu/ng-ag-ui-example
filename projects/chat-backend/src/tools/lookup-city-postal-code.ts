export const LOOKUP_CITY_POSTAL_CODE_TOOL = {
  name: 'lookup_city_postal_code',
  description: `Look up postal codes for a French city before changing the user's city.
    Uses the current address to prefer a unique match in the same postal area.
    If status is found, use the returned address.city and address.zipCode together
    in change_user_settings_form_state. If ambiguous or not_found, ask the user
    to clarify and do not change either address field. Never invent a postal code.
    This tool only looks up an address; it does not change the form.`,
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'The new French city name.' },
    },
    required: ['city'],
    additionalProperties: false,
  },
};
