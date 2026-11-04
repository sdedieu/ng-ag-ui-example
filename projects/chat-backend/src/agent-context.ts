interface ClientContext {
  currentDate: string;
  timeZone: string;
}

function isClientContext(value: unknown): value is ClientContext {
  if (!value || typeof value !== 'object' ||
    !('currentDate' in value) || typeof value.currentDate !== 'string' ||
    !('timeZone' in value) || typeof value.timeZone !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.currentDate)) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value.timeZone });
    const date = new Date(`${value.currentDate}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.currentDate;
  } catch {
    return false;
  }
}

export function getAgentInstructions(context: unknown, features: { tools?: boolean } = {}, now = new Date()): string {
  const { currentDate, timeZone } = isClientContext(context)
    ? context
    : { currentDate: now.toISOString().slice(0, 10), timeZone: 'UTC' };
  return `You are a helpful assistant.
Current local date: ${currentDate}. User time zone: ${timeZone}.
Resolve relative dates such as "tomorrow" using this local date, not your training date.
For a month/day without a year, use the first valid occurrence on or after the requested or existing start date
(or today if there is no start date). Respect explicitly supplied years. Ask only when genuinely ambiguous.
${

features.tools ? `Use the registered tools to operate the application.
Send resolved calendar dates in YYYY-MM-DD format through the appropriate tool.
Apply all valid changes the user supplied, even if other required fields are still missing.
Use partial updates to preserve existing fields; do not reset a draft when handling a follow-up.
Never submit a form unless the user explicitly asks.` : ''

}
`;
}
