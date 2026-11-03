import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/card/card.component';
import { Chip } from '../../shared/ui/chip/chip.component';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Button } from '../../shared/ui/button/button';
import { DashboardStateService } from './dashboard.state';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'dashboard',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-4',
  },
  template: `<card>
    <card-header>
      <p card-description>
        {{ 'Manage your campaigns' | uppercase }}
      </p>
      <h1 card-title>Dashboard</h1>
      <div card-action>
        <a
          color="primary"
          id="create-campaign-button"
          routerLink="/create-campaign"
        >
          Create campaign
        </a>
      </div>
    </card-header>
    <card-content>
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
    </card-content>
  </card>`,
  imports: [
    Button,
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Chip,
    CurrencyPipe,
    UpperCasePipe,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dashboardStateService = inject(DashboardStateService);
  readonly campaigns = this.dashboardStateService.campaigns;
}
