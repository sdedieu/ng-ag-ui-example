import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Card } from '../../shared/ui/card/card.component';
import { Chip } from '../../shared/ui/chip/chip.component';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Button } from '../../shared/ui/button/button';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { CreateCampaignDialogComponent } from '../create-campaign/create-campaign.dialog';
import { firstValueFrom } from 'rxjs';
import { DashboardStateService } from './dashboard.state';
import { CreateCampaignState } from '../create-campaign/create-campaign.state';

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
      <button
        color="primary"
        id="create-campaign-button"
        (click)="openCreateCampaignDialog()"
      >
        Create campaign
      </button>
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
  imports: [Button, Card, Chip, CurrencyPipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dialogService = inject(DialogService);
  private readonly dashboardStateService = inject(DashboardStateService);

  readonly campaigns = this.dashboardStateService.campaigns;

  async openCreateCampaignDialog() {
    const dialogRef = this.dialogService.open<CreateCampaignState>(
      CreateCampaignDialogComponent,
      {
        panelClass: 'w-screen h-screen',
      },
    );
    const result = await firstValueFrom(dialogRef.afterClosed$);
    if (result)
      this.dashboardStateService.addCampaign({
        name: result.name,
        budget: result.totalBudget,
        revenue: 0,
        status: 'alive',
      });
  }
}
