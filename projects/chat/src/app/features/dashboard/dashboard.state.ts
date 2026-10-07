import { computed, Injectable, signal } from '@angular/core';

interface DashboardState {
  campaigns: Campaign[];
}

interface Campaign {
  id: number;
  name: string;
  budget: number;
  revenue: number;
  status: 'alive' | 'paused';
}

const defaultState: DashboardState = {
  campaigns: [
    {
      id: 1,
      name: 'Product 1',
      budget: 34300,
      revenue: 53699,
      status: 'alive',
    },
    {
      id: 2,
      name: 'Product 2',
      budget: 24300,
      revenue: 13600,
      status: 'paused',
    },
    {
      id: 3,
      name: 'Product 3',
      budget: 105300,
      revenue: 120000,
      status: 'alive',
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class DashboardStateService {
  protected readonly _state = signal(defaultState);

  readonly state = this._state.asReadonly();

  readonly campaigns = computed(() => this._state().campaigns);

  addCampaign(campaign: Omit<Campaign, 'id'>): void {
    this._state.update((state) => ({
      ...state,
      campaigns: [
        ...state.campaigns,
        {
          ...campaign,
          id: Math.max(...state.campaigns.map((c) => c.id), 0) + 1,
        },
      ],
    }));
  }
}
