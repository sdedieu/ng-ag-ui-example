const percentage = {
  type: 'number',
  minimum: 0,
  maximum: 100,
  description: 'Finite percentage from 0 to 100 inclusive. Zero is valid.',
};
const amount = {
  type: 'number',
  minimum: 0,
  description:
    'Finite, nonnegative amount. Zero is valid unless this field explicitly requires a positive value for launch.',
};
const date = {
  type: 'string',
  pattern: '^(\\d{4}-\\d{2}-\\d{2})?$',
  description:
    'Required for launch: a real calendar date in YYYY-MM-DD format, with year 0001–9999. Both campaign dates are inclusive. Empty only while awaiting the user; never invent a date.',
};

// Fixed form options: only numeric settings and enabled/selected may change.
// Keep these identities and display values aligned with CreateCampaignState.
const campaignOptions = {
  channels: [
    {
      id: 'paid-search',
      label: 'Paid search',
      description: 'Capture high-intent demand and defend priority keywords.',
      kpi: 'pipeline',
    },
    {
      id: 'paid-social',
      label: 'Paid social',
      description:
        'Create demand with lookalikes, retargeting, and creative tests.',
      kpi: 'cpa',
    },
    {
      id: 'programmatic',
      label: 'Programmatic display',
      description: 'Bid for reach across curated publishers and account lists.',
      kpi: 'reach',
    },
    {
      id: 'partner',
      label: 'Partner placements',
      description:
        'Reserve spend for sponsored newsletters and marketplace slots.',
      kpi: 'pipeline',
    },
    {
      id: 'retargeting',
      label: 'Retargeting pool',
      description:
        'Re-engage visitors, sales-qualified accounts, and abandoned demos.',
      kpi: 'roas',
    },
  ],
  audienceSegments: [
    {
      id: 'enterprise-it',
      label: 'Enterprise IT decision makers',
      description:
        'Director+ buyers in security, infrastructure, and platform teams.',
    },
    {
      id: 'finance-ops',
      label: 'Finance and operations leaders',
      description: 'Budget owners evaluating efficiency and operational risk.',
    },
    {
      id: 'active-pipeline',
      label: 'Open opportunity accounts',
      description: 'Accounts already attached to active sales opportunities.',
    },
    {
      id: 'lookalikes',
      label: 'High-value customer lookalikes',
      description:
        'Prospects modeled from customers with strong retention profiles.',
    },
    {
      id: 'students',
      label: 'Students and hobbyists',
      description:
        'Low-fit users with high curiosity and limited commercial intent.',
    },
  ],
  dayWeights: [
    {
      id: 'mon',
      label: 'Monday',
    },
    {
      id: 'tue',
      label: 'Tuesday',
    },
    {
      id: 'wed',
      label: 'Wednesday',
    },
    {
      id: 'thu',
      label: 'Thursday',
    },
    {
      id: 'fri',
      label: 'Friday',
    },
    {
      id: 'sat',
      label: 'Saturday',
    },
    {
      id: 'sun',
      label: 'Sunday',
    },
  ],
  dayParts: [
    {
      id: 'early',
      label: 'Morning research',
      hours: '06:00 - 09:00',
    },
    {
      id: 'workday',
      label: 'Core business hours',
      hours: '09:00 - 16:00',
    },
    {
      id: 'commute',
      label: 'Commute and catch-up',
      hours: '16:00 - 19:00',
    },
    {
      id: 'late',
      label: 'Late-night browsing',
      hours: '19:00 - 01:00',
    },
  ],
};

function fixedOptionsSchema(
  options: readonly (Record<string, string> & { id: string })[],
  configurable: Record<string, Record<string, unknown>>,
  description: string,
) {
  return {
    type: 'array',
    description,
    minItems: options.length,
    maxItems: options.length,
    items: {
      anyOf: options.map((option) => ({
        type: 'object',
        additionalProperties: false,
        properties: {
          ...Object.fromEntries(
            Object.entries(option).map(([key, value]) => [
              key,
              { type: 'string', enum: [value] },
            ]),
          ),
          ...configurable,
        },
        required: [...Object.keys(option), ...Object.keys(configurable)],
      })),
    },
    // Exact length plus one occurrence of every id prevents additions,
    // removals and duplicates, even when duplicate entries have different bids.
    allOf: options.map(({ id }) => ({
      contains: {
        type: 'object',
        properties: { id: { type: 'string', enum: [id] } },
        required: ['id'],
      },
    })),
  };
}

// This intentionally incomplete draft reuses the fixed options from the schema.
// Its empty strings and zero channel caps/bids still require user input.
const sneakerDraftExample = {
  name: 'Snickers campaign',
  objective: 'revenue',
  currency: '',
  totalBudget: 0,
  startDate: '',
  endDate: '',
  pacing: 'adaptive',
  optimizationWindow: '7d',
  reserveBudget: 0,
  frontloadPercent: 0,
  channels: campaignOptions.channels.map((channel, index) => ({
    ...channel,
    allocation: [30, 45, 5, 0, 20][index],
    dailyCap: 0,
    maxBid: 0,
    enabled: channel.id !== 'partner',
  })),
  audienceSegments: campaignOptions.audienceSegments.map((segment) => ({
    ...segment,
    bidAdjustment: ['lookalikes', 'students'].includes(segment.id) ? 10 : 0,
    selected: ['lookalikes', 'students'].includes(segment.id),
  })),
  minAge: 18,
  maxAge: 34,
  locations: '',
  exclusions: '',
  devices: {
    desktop: true,
    mobile: true,
    tablet: true,
    connectedTv: false,
  },
  dayWeights: campaignOptions.dayWeights.map((day, index) => ({
    ...day,
    enabled: true,
    weight: [12, 12, 12, 12, 16, 18, 18][index],
  })),
  dayParts: campaignOptions.dayParts.map((part, index) => ({
    ...part,
    enabled: true,
    bidMultiplier: [0.8, 1, 1.1, 1.2][index],
    budgetShare: [10, 20, 30, 40][index],
  })),
  priorityMode: 'balanced',
  priorityScore: 50,
  overlapPolicy: 'bid-down',
  auctionStrategy: 'value-max',
  shareOfVoiceTarget: 0,
  cannibalizationGuard: true,
  canBorrowBudget: false,
  competitorCampaigns: '',
  kpiGuardrail: {
    maxCac: 0,
    minRoas: 0,
    stopLossPercent: 0,
    learningBudget: 0,
  },
};

export const CHANGE_CREATE_CAMPAIGN_FORM_STATE_TOOL = {
  name: 'change_create_campaign_form_state',
  description: `Fill the Create Campaign form from an ordinary-language campaign brief. Include a change_create_campaign_form_state call when creating a new campaign draft, even if the brief gives only a product and a sales goal. For example, "I want to create a new campaign for improving the sells of my snickers (shoes)" is enough to generate a useful draft. This tool's arguments are the campaign state itself. Navigating to the page alone does not fill the form and does not complete this request. For follow-up configuration, apply valid changes; if the user supplies only invalid values, ask for corrections instead of sending an empty or invalid patch.

Required calls for a new campaign, all in the SAME assistant response:
1. router_navigate with {"route":"create-campaign"}.
2. change_create_campaign_form_state with the generated draft object.
Include both calls in that order. Do not defer the state call to a later turn, wait for the user to repeat the request, or wait for tool results to construct the draft: its values come from the brief and the schema below. Missing required business inputs must not prevent the draft call. No current route or live form state is needed to create a new draft. For a follow-up update in a supplied campaign conversation, call this tool with only changed fields; do not re-navigate to the page unnecessarily.

Generate a draft:
- Infer a concise name and objective: revenue for sales, pipeline for leads, retention for existing customers, awareness for reach. Preserve the user's product/brand wording.
- Suggest an age range, device selection, available audience selections, channel allocations, weekly weights, daypart shares, pacing, priority and auction settings suited to the brief. Explicit user choices take precedence. Explain inferred targeting/scheduling as suggestions, not proven facts or guaranteed performance.
- For a new campaign, produce a draft containing every field like the example below. Do not copy unrelated enterprise planning values. Use "" for unknown currency, startDate, endDate and locations, and 0 for unknown totalBudget and channel dailyCap/maxBid. These are incomplete placeholders, not valid launch values. Use 0 for unspecified reserveBudget and KPI guardrails, and "" for unspecified exclusions and competitorCampaigns; those values are valid. Do not invent commercial facts or positive caps/bids just to pass validation. Keep canBorrowBudget false unless requested.
- Ask a concise grouped question in normal chat for missing or invalid required inputs, following the validation rules below. Asking questions does not replace creating the draft or applying other valid updates. Never submit the campaign automatically.

Campaign form validation (keep aligned with projects/chat/src/app/features/create-campaign/create-campaign.schema.ts):
These are requirements for the resulting campaign to be ready, not required keys in every tool call. The tool accepts incomplete drafts and partial patches so the user can fill the form progressively.
- Required text: name and locations must contain non-whitespace text. A product-based name may be inferred; target locations must come from the user. exclusions and competitorCampaigns are optional and may remain empty.
- Required selections: objective, currency, pacing, optimizationWindow, priorityMode, overlapPolicy and auctionStrategy must each be one of the non-empty enum values in the parameter schema. Currency must be USD, GBP or EUR; "" is an incomplete draft placeholder.
- Required budget: totalBudget must be finite and strictly greater than 0. reserveBudget must be present, finite and >= 0, and must not exceed totalBudget. A zero reserve is valid.
- Required dates: startDate and endDate must be real YYYY-MM-DD calendar dates, not just strings matching the format. Reject impossible dates such as February 30. startDate <= endDate; equal dates are valid for a one-day campaign. Ask for exact dates if relative dates cannot be resolved from the supplied context.
- Channels: enable at least one. For every enabled channel, allocation is required and must be finite in [0, 100], dailyCap and maxBid are required and must each be finite and strictly > 0, and kpi must be a valid option (preserve the fixed KPI supplied below). Enabled allocations must total 100%. Zero caps/bids on enabled channels are unresolved required inputs even after totalBudget is supplied. Disabled channels do not need positive caps/bids and do not contribute to allocation totals.
- Audiences and devices: select at least one audience segment and at least one device. Each selected audience's bidAdjustment is required, finite and >= -100; 0 is neutral and there is no upper bound. Unselected audience adjustments do not block readiness.
- Ages: minAge and maxAge are required, finite, nonnegative whole numbers with minAge <= maxAge. Equal ages are valid.
- Weekly schedule: enable at least one day. Each enabled day's weight is required and finite in [0, 100]; enabled weights must total 100%.
- Dayparts: enable at least one. Each enabled part's bidMultiplier is required, finite and strictly > 0, and budgetShare is required and finite in [0, 100]. Enabled budgetShare values must total 100%. Disabled days/dayparts do not contribute to totals or require valid numeric settings. Allow ordinary floating-point rounding when checking the 100% totals.
- Other percentages: frontloadPercent, priorityScore, shareOfVoiceTarget and kpiGuardrail.stopLossPercent are required, finite values in [0, 100]. Zero is valid.
- Other guardrails: kpiGuardrail.maxCac, minRoas and learningBudget are required, finite and >= 0. learningBudget must not exceed totalBudget. All three may legitimately be 0; do not treat those zeros as missing.

Missing-input and correction workflow:
1. Assess the resulting draft using the supplied campaign context plus the proposed patch. A field omitted from a follow-up patch keeps its previous value; omission alone does not mean it is missing. Use only context actually supplied to you. Without campaign context, do not claim to know existing values or that the whole form is ready.
2. Fill safe planning suggestions as described above. Ask for missing business facts: total budget and currency, dates, locations, and positive daily caps and max bids for each enabled channel. Name the affected channels and group related questions. Ask only for unresolved inputs; do not repeat values already supplied or ask for optional text and valid zero settings.
3. If a supplied value violates a rule, explain the specific constraint and ask for a correction. For example, an end date before the start date needs clarification, and a reserve exceeding totalBudget requires a revised reserve or total budget. Do not silently replace explicit user choices. Apply other valid changes, leaving the invalid change out of a follow-up patch or using the allowed incomplete placeholder in a new draft. For inconsistent allocations or schedules, explain that the enabled shares must total 100% and ask which shares to adjust.
4. After each update, recheck dependent rules, including reserve/learning budgets when totalBudget changes and shares/caps/bids when options are enabled. Keep asking for remaining blockers even when the latest answer fixes one of them. Only describe a campaign as ready when all the above requirements can be verified from the supplied context. Clearly label drafts with unresolved fields as incomplete.

Fixed array options (mandatory):
channels, audienceSegments, dayWeights and dayParts are fixed lists of existing form options. NEVER add, remove, replace, rename or repurpose an option. Do not create audience segments such as "sneaker-enthusiasts". Select the closest available options instead. Preserve each id, label, description, channel kpi and daypart hours EXACTLY as specified by the schema, including wording that seems unrelated to the brief. Keep the existing order. The only editable fields inside these arrays are:
- channels: enabled, allocation, dailyCap, maxBid.
- audienceSegments: selected, bidAdjustment.
- dayWeights: enabled, weight.
- dayParts: enabled, bidMultiplier, budgetShare.
The form replaces arrays in full, so include every existing entry exactly once with all properties when supplying an array, including unselected/disabled entries. Do not send just an id and a boolean or omit inactive options. Their fixed metadata is provided in the schema; it does not need to come from the user or live state.

Argument and consistency rules:
Return a plain CreateCampaignState object as the function arguments, without a state wrapper, commentary or questions. All top-level fields are optional for follow-up patches; omitted fields stay unchanged. Nested devices and kpiGuardrail properties may be patched independently. Do not use null, undefined or extra keys.
Use the parameter schema for tool argument shapes and the campaign validation rules above for readiness. Prefer 0 shares for disabled entries in a new draft; on follow-ups preserve their existing values because the form ignores inactive settings. Do not change immutable channel KPIs to match the campaign objective. Preserve previously supplied choices on follow-ups.

Complete example for the snickers/shoes sales brief:
After the navigation call, include change_create_campaign_form_state with these arguments in the SAME response. The students and lookalikes options are selected as provisional matches for adult shoe shoppers; the existing enterprise options remain present but unselected. Evening/weekend emphasis is a suggestion. This is an example for this brief, not a default for every product. The draft is incomplete: it lacks confirmed budget, currency, dates, locations, and positive daily caps/max bids for its four enabled channels.
${JSON.stringify(sneakerDraftExample)}
Ask: "What total budget and currency, start/end dates, and target locations should I use? What positive daily cap and max bid should I set for each enabled channel: Paid search, Paid social, Programmatic display, and Retargeting pool?"
If this draft is included in the supplied conversation and the subsequent answer is "5000 EUR", use {"totalBudget":5000,"currency":"EUR"}, preserving the rest of the draft. Then ask only for the unresolved dates, locations, and enabled-channel daily caps/max bids. Do not say the campaign is ready just because its total budget is now positive.`,
  parameters: {
    type: 'object',
    minProperties: 1,
    additionalProperties: false,
    description:
      'Partial CreateCampaignState patch, not a launch request. All top-level keys may be omitted to preserve existing values. Include supplied values, identified planning suggestions, or permitted empty/zero placeholders in a new draft. A schema-valid tool call may still leave the form invalid; ask for unresolved required inputs using the tool description. Arrays replace the whole collection.',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        pattern: '\\S',
        description: 'Required, nonblank product/brand campaign name.',
      },
      objective: {
        type: 'string',
        enum: ['pipeline', 'revenue', 'retention', 'awareness'],
        description:
          'Revenue for sales, pipeline for leads, retention for existing customers, awareness for reach.',
      },
      currency: {
        type: 'string',
        enum: ['', 'USD', 'GBP', 'EUR'],
        description:
          'User-specified currency; empty only for an unconfirmed new draft.',
      },
      totalBudget: {
        ...amount,
        description:
          'Total campaign budget, not a daily amount. Must be positive when ready; 0 means awaiting the user.',
      },
      startDate: {
        ...date,
        description: `${date.description} Must be on or before endDate.`,
      },
      endDate: {
        ...date,
        description: `${date.description} Must be on or after startDate.`,
      },
      pacing: {
        type: 'string',
        enum: ['even', 'accelerated', 'adaptive', 'manual'],
      },
      optimizationWindow: {
        type: 'string',
        enum: ['1d', '7d', '14d', '30d'],
      },
      reserveBudget: {
        ...amount,
        description:
          'Required nonnegative amount held back; 0 is valid. Cannot exceed totalBudget.',
      },
      frontloadPercent: percentage,
      channels: fixedOptionsSchema(
        campaignOptions.channels,
        {
          allocation: percentage,
          dailyCap: {
            ...amount,
            description:
              'Required and strictly positive when this channel is enabled. In campaign currency. Zero is allowed in a draft but requires a follow-up question for enabled channels; it is valid for disabled channels.',
          },
          maxBid: {
            ...amount,
            description:
              'Required and strictly positive when this channel is enabled. In campaign currency. Zero is allowed in a draft but requires a follow-up question for enabled channels; it is valid for disabled channels.',
          },
          enabled: { type: 'boolean' },
        },
        'Exactly the five existing channels in their original order. Change only enabled, allocation, dailyCap and maxBid. Preserve all text, including kpi. Enable at least one channel; enabled allocations sum to 100. Every enabled channel needs positive dailyCap and maxBid before launch.',
      ),
      audienceSegments: fixedOptionsSchema(
        campaignOptions.audienceSegments,
        {
          bidAdjustment: {
            type: 'number',
            minimum: -100,
            description:
              'Required for selected audiences: finite percentage adjustment >= -100, with no upper bound. Zero is valid and neutral.',
          },
          selected: { type: 'boolean' },
        },
        'Exactly the five existing audience options in their original order. Change only selected and bidAdjustment; never create or rename a segment. Select at least one.',
      ),
      minAge: {
        type: 'integer',
        minimum: 0,
        description: 'Required nonnegative whole-number age; must be <= maxAge.',
      },
      maxAge: {
        type: 'integer',
        minimum: 0,
        description: 'Required nonnegative whole-number age; must be >= minAge.',
      },
      locations: {
        type: 'string',
        pattern: '^$|\\S',
        description:
          'Required nonblank countries, regions or cities supplied by the user, one per line. Empty is only an incomplete draft placeholder; ask when missing. Whitespace alone is invalid.',
      },
      exclusions: {
        type: 'string',
        description:
          'Audience exclusions, one per line. Empty when none are specified.',
      },
      devices: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        description:
          'Partial device selection. At least one device must be true in the resulting campaign after merging this patch.',
        properties: {
          desktop: { type: 'boolean' },
          mobile: { type: 'boolean' },
          tablet: { type: 'boolean' },
          connectedTv: { type: 'boolean' },
        },
      },
      dayWeights: fixedOptionsSchema(
        campaignOptions.dayWeights,
        {
          enabled: { type: 'boolean' },
          weight: percentage,
        },
        'Exactly mon, tue, wed, thu, fri, sat, sun in this order. Change only enabled and weight. Enable at least one day. Enabled weights sum to 100; disabled weights do not contribute.',
      ),
      dayParts: fixedOptionsSchema(
        campaignOptions.dayParts,
        {
          enabled: { type: 'boolean' },
          bidMultiplier: {
            ...amount,
            description:
              'Required and strictly positive for enabled dayparts. Zero is permitted for disabled dayparts or an incomplete draft only; an enabled zero multiplier must be corrected before launch.',
          },
          budgetShare: percentage,
        },
        'Exactly early, workday, commute, late in this order. Change only enabled, bidMultiplier and budgetShare. Preserve ids, labels and hours. Enable at least one daypart. Enabled budget shares sum to 100; disabled shares do not contribute. Enabled bid multipliers must be positive.',
      ),
      priorityMode: {
        type: 'string',
        enum: ['balanced', 'front-run', 'protect-evergreen', 'last-touch'],
      },
      priorityScore: percentage,
      overlapPolicy: {
        type: 'string',
        enum: ['exclude-active', 'bid-down', 'highest-priority', 'allow'],
      },
      auctionStrategy: {
        type: 'string',
        enum: ['cost-cap', 'bid-cap', 'value-max', 'rank-defense'],
      },
      shareOfVoiceTarget: percentage,
      cannibalizationGuard: { type: 'boolean' },
      canBorrowBudget: {
        type: 'boolean',
        description: 'Only enable budget borrowing when requested.',
      },
      competitorCampaigns: {
        type: 'string',
        description:
          'Known competing campaign names, comma separated. Do not invent campaigns.',
      },
      kpiGuardrail: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          maxCac: {
            ...amount,
            description:
              'Required nonnegative maximum acquisition cost in campaign currency; 0 is valid.',
          },
          minRoas: {
            ...amount,
            description:
              'Required nonnegative minimum return on ad spend as a ratio, e.g. 3 means 3x. Zero is valid.',
          },
          stopLossPercent: percentage,
          learningBudget: {
            ...amount,
            description:
              'Required nonnegative learning budget in campaign currency; 0 is valid. Cannot exceed totalBudget.',
          },
        },
      },
    },
  },
};
