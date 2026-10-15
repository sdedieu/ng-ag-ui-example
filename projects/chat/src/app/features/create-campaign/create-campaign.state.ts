import { effect, inject, Injectable, signal } from '@angular/core';
import { GenricFormStateService } from '../../shared/service/generic-form-state.service';
import { DashboardStateService } from '../dashboard/dashboard.state';
import { form } from '@angular/forms/signals';
import { createCampaignSchema } from './create-campaign.schema';
import { ApiService } from '../../shared/service/api.service';

export interface BudgetChannel {
  id: string;
  label: string;
  description: string;
  allocation: number;
  dailyCap: number;
  maxBid: number;
  kpi: string;
  enabled: boolean;
}

export interface AudienceSegment {
  id: string;
  label: string;
  description: string;
  bidAdjustment: number;
  selected: boolean;
}

export interface DayWeight {
  id: string;
  label: string;
  enabled: boolean;
  weight: number;
}

export interface DayPart {
  id: string;
  label: string;
  hours: string;
  enabled: boolean;
  bidMultiplier: number;
  budgetShare: number;
}

export interface CreateCampaignState {
  name: string;
  objective: string;
  currency: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  pacing: string;
  optimizationWindow: string;
  reserveBudget: number;
  frontloadPercent: number;
  channels: BudgetChannel[];
  audienceSegments: AudienceSegment[];
  minAge: number;
  maxAge: number;
  locations: string;
  exclusions: string;
  devices: {
    desktop: boolean;
    mobile: boolean;
    tablet: boolean;
    connectedTv: boolean;
  };
  dayWeights: DayWeight[];
  dayParts: DayPart[];
  priorityMode: string;
  priorityScore: number;
  overlapPolicy: string;
  auctionStrategy: string;
  shareOfVoiceTarget: number;
  cannibalizationGuard: boolean;
  canBorrowBudget: boolean;
  competitorCampaigns: string;
  kpiGuardrail: {
    maxCac: number;
    minRoas: number;
    stopLossPercent: number;
    learningBudget: number;
  };
}

const defaultState: CreateCampaignState = {
  name: '',
  objective: '',
  currency: '',
  totalBudget: 0,
  startDate: '',
  endDate: '',
  pacing: '',
  optimizationWindow: '',
  reserveBudget: 0,
  frontloadPercent: 0,
  channels: [
    {
      id: 'paid-search',
      label: 'Paid search',
      description: 'Capture high-intent demand and defend priority keywords.',
      allocation: 0,
      dailyCap: 0,
      maxBid: 0,
      kpi: 'pipeline',
      enabled: true,
    },
    {
      id: 'paid-social',
      label: 'Paid social',
      description:
        'Create demand with lookalikes, retargeting, and creative tests.',
      allocation: 0,
      dailyCap: 0,
      maxBid: 0,
      kpi: 'cpa',
      enabled: true,
    },
    {
      id: 'programmatic',
      label: 'Programmatic display',
      description: 'Bid for reach across curated publishers and account lists.',
      allocation: 0,
      dailyCap: 0,
      maxBid: 0,
      kpi: 'reach',
      enabled: true,
    },
    {
      id: 'partner',
      label: 'Partner placements',
      description:
        'Reserve spend for sponsored newsletters and marketplace slots.',
      allocation: 0,
      dailyCap: 0,
      maxBid: 0,
      kpi: 'pipeline',
      enabled: true,
    },
    {
      id: 'retargeting',
      label: 'Retargeting pool',
      description:
        'Re-engage visitors, sales-qualified accounts, and abandoned demos.',
      allocation: 0,
      dailyCap: 0,
      maxBid: 0,
      kpi: 'roas',
      enabled: true,
    },
  ],
  audienceSegments: [
    {
      id: 'enterprise-it',
      label: 'Enterprise IT decision makers',
      description:
        'Director+ buyers in security, infrastructure, and platform teams.',
      bidAdjustment: 0,
      selected: true,
    },
    {
      id: 'finance-ops',
      label: 'Finance and operations leaders',
      description: 'Budget owners evaluating efficiency and operational risk.',
      bidAdjustment: 0,
      selected: true,
    },
    {
      id: 'active-pipeline',
      label: 'Open opportunity accounts',
      description: 'Accounts already attached to active sales opportunities.',
      bidAdjustment: 0,
      selected: true,
    },
    {
      id: 'lookalikes',
      label: 'High-value customer lookalikes',
      description:
        'Prospects modeled from customers with strong retention profiles.',
      bidAdjustment: 0,
      selected: true,
    },
    {
      id: 'students',
      label: 'Students and hobbyists',
      description:
        'Low-fit users with high curiosity and limited commercial intent.',
      bidAdjustment: 0,
      selected: false,
    },
  ],
  minAge: 18,
  maxAge: 105,
  locations: 'United States\nUnited Kingdom\nFrance\nGermany',
  exclusions:
    'Existing customers in renewal window\nCompetitors\nRecent unsubscribers\nAccounts with open support escalations',
  devices: {
    desktop: true,
    mobile: true,
    tablet: true,
    connectedTv: false,
  },
  dayWeights: [
    { id: 'mon', label: 'Monday', enabled: true, weight: 16 },
    { id: 'tue', label: 'Tuesday', enabled: true, weight: 18 },
    { id: 'wed', label: 'Wednesday', enabled: true, weight: 18 },
    { id: 'thu', label: 'Thursday', enabled: true, weight: 18 },
    { id: 'fri', label: 'Friday', enabled: true, weight: 16 },
    { id: 'sat', label: 'Saturday', enabled: false, weight: 7 },
    { id: 'sun', label: 'Sunday', enabled: false, weight: 7 },
  ],
  dayParts: [
    {
      id: 'early',
      label: 'Morning research',
      hours: '06:00 - 09:00',
      enabled: true,
      bidMultiplier: 0,
      budgetShare: 0,
    },
    {
      id: 'workday',
      label: 'Core business hours',
      hours: '09:00 - 16:00',
      enabled: true,
      bidMultiplier: 0,
      budgetShare: 0,
    },
    {
      id: 'commute',
      label: 'Commute and catch-up',
      hours: '16:00 - 19:00',
      enabled: true,
      bidMultiplier: 0,
      budgetShare: 0,
    },
    {
      id: 'late',
      label: 'Late-night browsing',
      hours: '19:00 - 01:00',
      enabled: true,
      bidMultiplier: 0,
      budgetShare: 0,
    },
  ],
  priorityMode: 'front-run',
  priorityScore: 0,
  overlapPolicy: 'highest-priority',
  auctionStrategy: 'rank-defense',
  shareOfVoiceTarget: 0,
  cannibalizationGuard: true,
  canBorrowBudget: true,
  competitorCampaigns: 'Always-on search, Brand defense, Webinar retargeting',
  kpiGuardrail: {
    maxCac: 0,
    minRoas: 0,
    stopLossPercent: 0,
    learningBudget: 0,
  },
};

@Injectable({
  providedIn: 'root',
})
export class CreateCampaignStateService extends GenricFormStateService<CreateCampaignState> {
  private readonly _dashboardStateService = inject(DashboardStateService);
  private readonly _apiService = inject(ApiService);

  protected override readonly _state = signal(defaultState);
  readonly campaignForm = form(this._state, createCampaignSchema);

  private readonly syncCampaignState = effect(() => {
    this._apiService.sendStateSnapshot({ createCampaign: this.state() });
  });

  reset(): void {
    this._state.set(defaultState);
  }

  submit(): void {
    const result = this.state();
    this._dashboardStateService.addCampaign({
      name: result.name,
      budget: result.totalBudget,
      revenue: 0,
      status: 'alive',
    });
  }
}
