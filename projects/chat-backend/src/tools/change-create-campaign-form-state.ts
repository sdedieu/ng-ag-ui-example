const percentage = { type: 'number', minimum: 0, maximum: 100 };
const amount = { type: 'number', minimum: 0 };
const date = {
  type: 'string',
  pattern: '^(\\d{4}-\\d{2}-\\d{2})?$',
  description:
    'Inclusive calendar date in YYYY-MM-DD format. Empty while awaiting the user; never invent a date.',
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

// Show the state call as part of the complete task, alongside navigation and
// clicking. The example reuses the same fixed options as the schema.
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
  description: `Fill the Create Campaign form from an ordinary-language campaign brief. ALWAYS include a change_create_campaign_form_state call when the user asks to create or configure a campaign, even if the brief gives only a product and a sales goal. For example, "I want to create a new campaign for improving the sells of my snickers (shoes)" is enough to generate a useful draft. This tool's arguments are the campaign state itself. Navigating to the page alone does not fill the form and does not complete this request.

Required calls for a new campaign, all in the SAME assistant response:
1. router_navigate with {"route":"create-campaign"}.
3. change_create_campaign_form_state with the generated draft object.
Include all two calls in that order. Do not defer the state call to a later turn, wait for the user to repeat the request, or wait for tool results to construct the draft: its values come from the brief and the schema below. Missing budget, currency or dates must not prevent the state call. No current route or live form state is needed. For a follow-up update in a supplied campaign conversation, call this tool with only changed fields; do not re-navigate to the page unnecessarily.

Generate a draft:
- Infer a concise name and objective: revenue for sales, pipeline for leads, retention for existing customers, awareness for reach. Preserve the user's product/brand wording.
- Suggest an age range, device selection, available audience selections, channel allocations, weekly weights, daypart shares, pacing, priority and auction settings suited to the brief. Explicit user choices take precedence. Explain inferred targeting/scheduling as suggestions, not proven facts or guaranteed performance.
- For a new campaign, produce a complete draft like the example below. Do not copy unrelated enterprise planning values. Use "" for unknown currency, startDate, endDate, locations, exclusions and competitorCampaigns; use 0 for an unknown totalBudget, reserveBudget, dailyCap, maxBid and KPI guardrail values. These placeholders mean incomplete, not a recommendation to spend zero. Do not invent commercial facts. Keep canBorrowBudget false unless requested.
- Ask a concise grouped question in normal chat for missing budget, currency, dates and target locations. Asking questions does not replace the state call. Required business inputs are name, objective, currency, positive totalBudget, startDate, endDate, at least one selected audience and daypart shares totaling 100. Do not claim the draft is ready when required inputs are unknown. Never submit the campaign automatically.

Fixed array options (mandatory):
channels, audienceSegments, dayWeights and dayParts are fixed lists of existing form options. NEVER add, remove, replace, rename or repurpose an option. Do not create audience segments such as "sneaker-enthusiasts". Select the closest available options instead. Preserve each id, label, description, channel kpi and daypart hours EXACTLY as specified by the schema, including wording that seems unrelated to the brief. Keep the existing order. The only editable fields inside these arrays are:
- channels: enabled, allocation, dailyCap, maxBid.
- audienceSegments: selected, bidAdjustment.
- dayWeights: enabled, weight.
- dayParts: enabled, bidMultiplier, budgetShare.
The form replaces arrays in full, so include every existing entry exactly once with all properties when supplying an array, including unselected/disabled entries. Do not send just an id and a boolean or omit inactive options. Their fixed metadata is provided in the schema; it does not need to come from the user or live state.

Argument and consistency rules:
Return a plain CreateCampaignState object as the function arguments, without a state wrapper, commentary or questions. All top-level fields are optional for follow-up patches; omitted fields stay unchanged. Nested devices and kpiGuardrail properties may be patched independently. Do not use null, undefined or extra keys.
Use the allowed enum values and valid YYYY-MM-DD dates with startDate <= endDate. Ask for exact dates when a relative date cannot be resolved from supplied context. Keep minAge <= maxAge, reserveBudget <= totalBudget and learningBudget <= totalBudget. Enabled channel allocations, day weights and daypart shares must each total 100; disabled entries have 0 shares. Keep at least one channel, day, daypart and audience active. Do not change immutable channel KPIs to match the campaign objective. Preserve previously supplied choices on follow-ups and never pretend to know conversation history that was not supplied.

Complete example for the snickers/shoes sales brief:
After the navigation and click calls, include change_create_campaign_form_state with these arguments in the SAME response. The students and lookalikes options are selected as provisional matches for adult shoe shoppers; the existing enterprise options remain present but unselected. Evening/weekend emphasis is a suggestion. This is an example for this brief, not a default for every product.
${JSON.stringify(sneakerDraftExample)}
Ask: "What total budget and currency should I use, what are the start and end dates, and which locations should this target?"
For a subsequent answer "5000 EUR", use {"totalBudget":5000,"currency":"EUR"}, preserving the rest of the draft.`,
  parameters: {
    type: 'object',
    minProperties: 1,
    additionalProperties: false,
    description:
      'Partial CreateCampaignState patch. Include supplied values, identified planning suggestions, or empty/zero placeholders for missing inputs in a new draft. Arrays replace the whole collection.',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        description: 'Concise product/brand campaign name.',
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
      startDate: date,
      endDate: date,
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
        description: 'Amount held back; cannot exceed totalBudget.',
      },
      frontloadPercent: percentage,
      channels: fixedOptionsSchema(
        campaignOptions.channels,
        {
          allocation: percentage,
          dailyCap: {
            ...amount,
            description: 'Daily cap in campaign currency; 0 while unconfirmed.',
          },
          maxBid: {
            ...amount,
            description:
              'Maximum bid in campaign currency; 0 while unconfirmed.',
          },
          enabled: { type: 'boolean' },
        },
        'Exactly the five existing channels in their original order. Change only enabled, allocation, dailyCap and maxBid. Preserve all text, including kpi. Enabled allocations sum to 100.',
      ),
      audienceSegments: fixedOptionsSchema(
        campaignOptions.audienceSegments,
        {
          bidAdjustment: {
            type: 'number',
            minimum: -100,
            description: 'Percentage bid adjustment; 0 is neutral.',
          },
          selected: { type: 'boolean' },
        },
        'Exactly the five existing audience options in their original order. Change only selected and bidAdjustment; never create or rename a segment. Select at least one.',
      ),
      minAge: { type: 'integer', minimum: 0 },
      maxAge: { type: 'integer', minimum: 0 },
      locations: {
        type: 'string',
        description:
          'User-specified countries, regions or cities, one per line. Ask when missing.',
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
        'Exactly mon, tue, wed, thu, fri, sat, sun in this order. Change only enabled and weight. Enabled weights sum to 100.',
      ),
      dayParts: fixedOptionsSchema(
        campaignOptions.dayParts,
        {
          enabled: { type: 'boolean' },
          bidMultiplier: { type: 'number', exclusiveMinimum: 0 },
          budgetShare: percentage,
        },
        'Exactly early, workday, commute, late in this order. Change only enabled, bidMultiplier and budgetShare. Preserve ids, labels and hours. Enabled budget shares sum to 100.',
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
            description: 'Maximum acquisition cost in campaign currency.',
          },
          minRoas: {
            ...amount,
            description:
              'Minimum return on ad spend as a ratio, e.g. 3 means 3x.',
          },
          stopLossPercent: percentage,
          learningBudget: {
            ...amount,
            description:
              'Learning budget in campaign currency; cannot exceed totalBudget.',
          },
        },
      },
    },
  },
};
