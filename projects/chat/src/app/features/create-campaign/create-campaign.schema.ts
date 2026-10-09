import {
  apply,
  applyEach,
  applyWhen,
  max,
  min,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import type { CreateCampaignState } from './create-campaign.state';

function numberSchema(
  label: string,
  options: {
    minimum?: number;
    maximum?: number;
    positive?: boolean;
    integer?: boolean;
  } = {},
) {
  return schema<number>((path) => {
    required(path, { message: `${label} is required` });
    validate(path, ({ value }) =>
      value() != null && !Number.isFinite(value())
        ? { kind: 'finite', message: `${label} must be a finite number` }
        : undefined,
    );
    min(path, options.minimum ?? 0, {
      message: `${label} must be at least ${options.minimum ?? 0}`,
    });
    if (options.maximum !== undefined) {
      max(path, options.maximum, {
        message: `${label} must be at most ${options.maximum}`,
      });
    }
    if (options.positive) {
      validate(path, ({ value }) =>
        value() === 0
          ? { kind: 'positive', message: `${label} must be greater than 0` }
          : undefined,
      );
    }
    if (options.integer) {
      validate(path, ({ value }) =>
        Number.isFinite(value()) && !Number.isInteger(value())
          ? { kind: 'integer', message: `${label} must be a whole number` }
          : undefined,
      );
    }
  });
}

function choiceSchema(label: string, choices: string[]) {
  return schema<string>((path) => {
    required(path, { message: `${label} is required` });
    validate(path, ({ value }) =>
      value() && !choices.includes(value())
        ? { kind: 'choice', message: `Select a valid ${label.toLowerCase()}` }
        : undefined,
    );
  });
}

function isCalendarDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.startsWith('0000')) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function shareTotalError(total: number, label: string) {
  return Number.isFinite(total) && Math.abs(total - 100) < 0.000001
    ? undefined
    : { kind: 'shareTotal', message: `${label} must total 100%` };
}

export const createCampaignSchema = schema<CreateCampaignState>((path) => {
  required(path.name, { message: 'Campaign name is required' });
  pattern(path.name, /\S/, { message: 'Campaign name must not be blank' });
  apply(
    path.objective,
    choiceSchema('Objective', [
      'pipeline',
      'revenue',
      'retention',
      'awareness',
    ]),
  );
  apply(path.currency, choiceSchema('Currency', ['USD', 'GBP', 'EUR']));
  apply(path.totalBudget, numberSchema('Total budget', { positive: true }));
  apply(path.reserveBudget, numberSchema('Reserve budget'));
  max(path.reserveBudget, ({ valueOf }) => valueOf(path.totalBudget), {
    message: 'Reserve budget cannot exceed total budget',
  });

  for (const [datePath, label] of [
    [path.startDate, 'Start date'],
    [path.endDate, 'End date'],
  ] as const) {
    required(datePath, { message: `${label} is required` });
    validate(datePath, ({ value }) =>
      value() && !isCalendarDate(value())
        ? {
            kind: 'date',
            message: `${label} must be a valid date in YYYY-MM-DD format`,
          }
        : undefined,
    );
  }
  validate(path.endDate, ({ value, valueOf }) => {
    const startDate = valueOf(path.startDate);
    const endDate = value();
    // Both dates are inclusive, so a one-day campaign is valid.
    return isCalendarDate(startDate) &&
      isCalendarDate(endDate) &&
      startDate > endDate
      ? {
          kind: 'dateOrder',
          message: 'End date must be on or after start date',
        }
      : undefined;
  });

  validate(path.channels, ({ value }) => {
    const enabled = value().filter((channel) => channel.enabled);
    return enabled.length === 0
      ? { kind: 'selection', message: 'At least one channel must be enabled' }
      : shareTotalError(
          enabled.reduce((sum, channel) => sum + channel.allocation, 0),
          'Enabled channel allocations',
        );
  });
  applyEach(path.channels, (channel) => {
    applyWhen(
      channel,
      ({ value }) => value().enabled,
      (enabled) => {
        apply(
          enabled.allocation,
          numberSchema('Channel allocation', { maximum: 100 }),
        );
        apply(
          enabled.dailyCap,
          numberSchema('Channel daily cap', { positive: true }),
        );
        apply(
          enabled.maxBid,
          numberSchema('Channel max bid', { positive: true }),
        );
        apply(
          enabled.kpi,
          choiceSchema('Channel KPI', ['roas', 'cpa', 'pipeline', 'reach']),
        );
      },
    );
  });

  validate(path.audienceSegments, ({ value }) =>
    value().some((segment) => segment.selected)
      ? undefined
      : {
          kind: 'selection',
          message: 'At least one audience segment must be selected',
        },
  );
  applyEach(path.audienceSegments, (segment) => {
    applyWhen(
      segment,
      ({ value }) => value().selected,
      (selected) => {
        apply(
          selected.bidAdjustment,
          numberSchema('Audience bid adjustment', { minimum: -100 }),
        );
      },
    );
  });
  apply(path.minAge, numberSchema('Minimum age', { integer: true }));
  apply(path.maxAge, numberSchema('Maximum age', { integer: true }));
  min(path.maxAge, ({ valueOf }) => valueOf(path.minAge), {
    message: 'Maximum age must be at least minimum age',
  });
  validate(path.devices, ({ value }) =>
    Object.values(value()).some(Boolean)
      ? undefined
      : { kind: 'selection', message: 'At least one device must be selected' },
  );
  required(path.locations, { message: 'Locations are required' });
  pattern(path.locations, /\S/, { message: 'Locations must not be blank' });

  validate(path.dayWeights, ({ value }) => {
    const enabled = value().filter((day) => day.enabled);
    return enabled.length === 0
      ? { kind: 'selection', message: 'At least one day must be enabled' }
      : shareTotalError(
          enabled.reduce((sum, day) => sum + day.weight, 0),
          'Enabled day weights',
        );
  });
  applyEach(path.dayWeights, (day) => {
    applyWhen(
      day,
      ({ value }) => value().enabled,
      (enabled) => {
        apply(
          enabled.weight,
          numberSchema('Day spend weight', { maximum: 100 }),
        );
      },
    );
  });
  validate(path.dayParts, ({ value }) => {
    const enabled = value().filter((part) => part.enabled);
    return enabled.length === 0
      ? { kind: 'selection', message: 'At least one daypart must be enabled' }
      : shareTotalError(
          enabled.reduce((sum, part) => sum + part.budgetShare, 0),
          'Enabled daypart shares',
        );
  });
  applyEach(path.dayParts, (part) => {
    applyWhen(
      part,
      ({ value }) => value().enabled,
      (enabled) => {
        apply(
          enabled.bidMultiplier,
          numberSchema('Daypart bid multiplier', { positive: true }),
        );
        apply(
          enabled.budgetShare,
          numberSchema('Daypart budget share', { maximum: 100 }),
        );
      },
    );
  });

  apply(
    path.priorityMode,
    choiceSchema('Priority mode', [
      'balanced',
      'front-run',
      'protect-evergreen',
      'last-touch',
    ]),
  );
  apply(path.priorityScore, numberSchema('Priority score', { maximum: 100 }));
  apply(
    path.shareOfVoiceTarget,
    numberSchema('Share of voice target', { maximum: 100 }),
  );
  apply(
    path.overlapPolicy,
    choiceSchema('Audience overlap policy', [
      'exclude-active',
      'bid-down',
      'highest-priority',
      'allow',
    ]),
  );
  apply(
    path.auctionStrategy,
    choiceSchema('Auction strategy', [
      'cost-cap',
      'bid-cap',
      'value-max',
      'rank-defense',
    ]),
  );
  apply(
    path.frontloadPercent,
    numberSchema('Front-load spend', { maximum: 100 }),
  );
  apply(
    path.pacing,
    choiceSchema('Pacing', ['even', 'accelerated', 'adaptive', 'manual']),
  );
  apply(
    path.optimizationWindow,
    choiceSchema('Optimization window', ['1d', '7d', '14d', '30d']),
  );
  apply(path.kpiGuardrail.maxCac, numberSchema('Max CAC'));
  apply(path.kpiGuardrail.minRoas, numberSchema('Minimum ROAS'));
  apply(
    path.kpiGuardrail.stopLossPercent,
    numberSchema('Stop-loss threshold', { maximum: 100 }),
  );
  apply(path.kpiGuardrail.learningBudget, numberSchema('Learning budget'));
  max(
    path.kpiGuardrail.learningBudget,
    ({ valueOf }) => valueOf(path.totalBudget),
    {
      message: 'Learning budget cannot exceed total budget',
    },
  );
});
