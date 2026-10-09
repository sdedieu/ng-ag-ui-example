import { inject, Injectable, signal } from '@angular/core';
import { GenricFormStateService } from '../../shared/service/generic-form-state.service';
import { DashboardStateService } from '../dashboard/dashboard.state';
import { form } from '@angular/forms/signals';
import { createCampaignSchema } from './create-campaign.schema';

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
  name: 'Q4 enterprise expansion',
  objective: 'pipeline',
  currency: 'USD',
  totalBudget: 125000,
  startDate: '',
  endDate: '',
  pacing: 'adaptive',
  optimizationWindow: '14d',
  reserveBudget: 12500,
  frontloadPercent: 35,
  channels: [
    {
      id: 'paid-search',
      label: 'Paid search',
      description: 'Capture high-intent demand and defend priority keywords.',
      allocation: 30,
      dailyCap: 4500,
      maxBid: 18,
      kpi: 'pipeline',
      enabled: true,
    },
    {
      id: 'paid-social',
      label: 'Paid social',
      description:
        'Create demand with lookalikes, retargeting, and creative tests.',
      allocation: 25,
      dailyCap: 3600,
      maxBid: 9.5,
      kpi: 'cpa',
      enabled: true,
    },
    {
      id: 'programmatic',
      label: 'Programmatic display',
      description: 'Bid for reach across curated publishers and account lists.',
      allocation: 18,
      dailyCap: 2800,
      maxBid: 6,
      kpi: 'reach',
      enabled: true,
    },
    {
      id: 'partner',
      label: 'Partner placements',
      description:
        'Reserve spend for sponsored newsletters and marketplace slots.',
      allocation: 12,
      dailyCap: 1800,
      maxBid: 12,
      kpi: 'pipeline',
      enabled: true,
    },
    {
      id: 'retargeting',
      label: 'Retargeting pool',
      description:
        'Re-engage visitors, sales-qualified accounts, and abandoned demos.',
      allocation: 15,
      dailyCap: 2200,
      maxBid: 14,
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
      bidAdjustment: 35,
      selected: true,
    },
    {
      id: 'finance-ops',
      label: 'Finance and operations leaders',
      description: 'Budget owners evaluating efficiency and operational risk.',
      bidAdjustment: 18,
      selected: true,
    },
    {
      id: 'active-pipeline',
      label: 'Open opportunity accounts',
      description: 'Accounts already attached to active sales opportunities.',
      bidAdjustment: 60,
      selected: true,
    },
    {
      id: 'lookalikes',
      label: 'High-value customer lookalikes',
      description:
        'Prospects modeled from customers with strong retention profiles.',
      bidAdjustment: 22,
      selected: true,
    },
    {
      id: 'students',
      label: 'Students and hobbyists',
      description:
        'Low-fit users with high curiosity and limited commercial intent.',
      bidAdjustment: -45,
      selected: false,
    },
  ],
  minAge: 25,
  maxAge: 64,
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
      bidMultiplier: 0.8,
      budgetShare: 10,
    },
    {
      id: 'workday',
      label: 'Core business hours',
      hours: '09:00 - 16:00',
      enabled: true,
      bidMultiplier: 1.35,
      budgetShare: 55,
    },
    {
      id: 'commute',
      label: 'Commute and catch-up',
      hours: '16:00 - 19:00',
      enabled: true,
      bidMultiplier: 1.05,
      budgetShare: 25,
    },
    {
      id: 'late',
      label: 'Late-night browsing',
      hours: '19:00 - 01:00',
      enabled: true,
      bidMultiplier: 0.7,
      budgetShare: 10,
    },
  ],
  priorityMode: 'front-run',
  priorityScore: 78,
  overlapPolicy: 'highest-priority',
  auctionStrategy: 'rank-defense',
  shareOfVoiceTarget: 42,
  cannibalizationGuard: true,
  canBorrowBudget: true,
  competitorCampaigns: 'Always-on search, Brand defense, Webinar retargeting',
  kpiGuardrail: {
    maxCac: 420,
    minRoas: 3.2,
    stopLossPercent: 18,
    learningBudget: 15000,
  },
};

@Injectable({
  providedIn: 'root',
})
export class CreateCampaignStateService extends GenricFormStateService<CreateCampaignState> {
  private readonly _dashboardStateService = inject(DashboardStateService);

  protected override readonly _state = signal(defaultState);
  readonly campaignForm = form(this._state, createCampaignSchema);

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
