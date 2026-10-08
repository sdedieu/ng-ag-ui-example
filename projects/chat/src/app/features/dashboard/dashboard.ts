import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Card } from '../../shared/ui/card/card.component';
import { Chip } from '../../shared/ui/chip/chip.component';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Button } from '../../shared/ui/button/button';
import { DashboardStateService } from './dashboard.state';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'dashboard',
  template: `<card>
    <div class="flex justify-between items-end mb-20 ">
      <div class="mr-40">
        <p
          class="mb-2 text-xs font-extrabold tracking-widest text-emerald-700 uppercase"
        >
          {{ 'Manage your campaigns' | uppercase }}
        </p>
        <h1 class="font-bold text-6xl">Dashboard</h1>
      </div>
      <a
        color="primary"
        id="create-campaign-button"
        routerLink="/create-campaign"
      >
        Create campaign
      </a>
    </div>
    <table class="w-full">
      <thead>
        <tr>
          <th>Campaign Name</th>
          <th>Budget</th>
          <th>Revenue</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @for (campaign of campaigns(); track campaign.id) {
          <tr>
            <td>
              <strong>{{ campaign.name }}</strong>
            </td>
            <td>{{ campaign.budget | currency }}</td>
            <td>{{ campaign.revenue | currency }}</td>
            <td>
              <chip
                [color]="campaign.status === 'alive' ? 'success' : 'danger'"
                >{{ campaign.status }}</chip
              >
            </td>
          </tr>
        }
      </tbody>
    </table>
  </card>`,
  imports: [Button, Card, Chip, CurrencyPipe, UpperCasePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dashboardStateService = inject(DashboardStateService);
  readonly campaigns = this.dashboardStateService.campaigns;
}
