import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../shared/ui/button/button';
import {
  FormField,
  FormFieldInput,
  FormFieldLabel,
  FormFieldSelect,
  FormFieldTextarea,
} from '../../shared/ui/form-field/form-field.component';
import { AllocationHealthComponent } from './form/allocation-health';
import { CampaignSectionComponent } from './form/campaign-section';
import { CreateCampaignStateService } from './create-campaign.state';
import { Field } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { DashboardStateService } from '../dashboard/dashboard.state';

@Component({
  selector: 'create-campaign-dialog',
  imports: [
    AllocationHealthComponent,
    Button,
    CampaignSectionComponent,
    CurrencyPipe,
    FormField,
    FormFieldInput,
    FormFieldLabel,
    FormFieldSelect,
    FormFieldTextarea,
    FormsModule,
    Field,
  ],
  template: `
    <form
      class="min-h-full bg-gray-50 text-gray-950"
      (ngSubmit)="createCampaign()"
    >
      <div
        class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              class="text-xs font-extrabold uppercase tracking-widest text-emerald-700"
            >
              Campaign command center
            </p>
            <h2 class="text-4xl font-bold">Create Campaign</h2>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" color="secondary" (click)="resetPlanning()">
              Reset plan
            </button>
            <button type="submit" color="primary">Create campaign</button>
          </div>
        </div>
      </div>

      <div class="grid gap-6 p-6 xl:grid-cols-3">
        <div class="space-y-6 xl:col-span-2">
          <campaign-section
            eyebrow="Foundation"
            title="Campaign Details"
            description="Define the business goal, active dates, and the base budget envelope before the spend rules take over."
          >
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              <form-field>
                <form-field-label>Campaign name</form-field-label>
                <input
                  form-field-input
                  id="createCampaignForm.ame"
                  [field]="createCampaignForm.name"
                  placeholder="Q4 enterprise expansion"
                />
              </form-field>

              <form-field>
                <form-field-label>Objective</form-field-label>
                <select
                  form-field-select
                  id="objective"
                  [field]="createCampaignForm.objective"
                >
                  <option value="pipeline">Qualified pipeline</option>
                  <option value="revenue">Revenue efficiency</option>
                  <option value="retention">Expansion retention</option>
                  <option value="awareness">Share of voice</option>
                </select>
              </form-field>

              <form-field>
                <form-field-label>Currency</form-field-label>
                <select
                  form-field-select
                  id="currency"
                  [field]="createCampaignForm.currency"
                >
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </form-field>

              <form-field>
                <form-field-label>Total budget</form-field-label>
                <input
                  form-field-input
                  id="totalBudget"
                  type="number"
                  [field]="createCampaignForm.totalBudget"
                />
              </form-field>

              <form-field>
                <form-field-label>Reserve budget</form-field-label>
                <input
                  form-field-input
                  id="reserveBudget"
                  type="number"
                  [field]="createCampaignForm.reserveBudget"
                />
              </form-field>

              <form-field>
                <form-field-label>Start date (included)</form-field-label>
                <input
                  form-field-input
                  id="startDate"
                  type="date"
                  [field]="createCampaignForm.startDate"
                />
              </form-field>

              <form-field>
                <form-field-label>End date (included)</form-field-label>
                <input
                  form-field-input
                  id="endDate"
                  type="date"
                  [field]="createCampaignForm.endDate"
                />
              </form-field>
            </div>
          </campaign-section>

          <campaign-section
            eyebrow="Spend map"
            title="Budget allocation"
            description="Decide where the money goes, how quickly each channel can spend, and which KPI each channel must defend."
          >
            <div class="space-y-3">
              @for (channel of channelsWithBudget(); track channel.id) {
                <div class="rounded-md border border-gray-200 bg-gray-50 p-4">
                  <div class="flex flex-wrap items-start justify-between gap-4">
                    <label class="flex items-start gap-3">
                      <input
                        type="checkbox"
                        class="mt-1 size-4"
                        [field]="createCampaignForm.channels[$index].enabled"
                      />
                      <span>
                        <span class="block font-bold">{{ channel.label }}</span>
                        <span class="block text-sm text-gray-600">
                          {{ channel.description }}
                        </span>
                      </span>
                    </label>
                    <strong class="text-lg">
                      {{
                        channel.budget
                          | currency
                            : createCampaignForm.currency().value()
                            : 'symbol'
                            : '1.0-0'
                      }}
                    </strong>
                  </div>

                  <div class="mt-4 grid gap-4 md:grid-cols-4">
                    <form-field class="flex-col items-start">
                      <form-field-label>Allocation %</form-field-label>
                      <input
                        form-field-input
                        [id]="'allocation' + channel.id"
                        type="number"
                        [field]="createCampaignForm.channels[$index].allocation"
                      />
                    </form-field>

                    <form-field class="flex-col items-start">
                      <form-field-label>Daily cap</form-field-label>
                      <input
                        form-field-input
                        [id]="'dailyCap' + channel.id"
                        type="number"
                        [field]="createCampaignForm.channels[$index].dailyCap"
                      />
                    </form-field>

                    <form-field class="flex-col items-start">
                      <form-field-label>Max bid</form-field-label>
                      <input
                        form-field-input
                        [id]="'maxBid' + channel.id"
                        type="number"
                        step="0.01"
                        [field]="createCampaignForm.channels[$index].maxBid"
                      />
                    </form-field>

                    <form-field class="flex-col items-start">
                      <form-field-label>KPI</form-field-label>
                      <select
                        form-field-select
                        [id]="'kpi' + channel.id"
                        [field]="createCampaignForm.channels[$index].kpi"
                      >
                        <option value="roas">ROAS</option>
                        <option value="cpa">CPA</option>
                        <option value="pipeline">Pipeline</option>
                        <option value="reach">Reach</option>
                      </select>
                    </form-field>
                  </div>
                </div>
              }
            </div>
          </campaign-section>

          <campaign-section
            eyebrow="Audience"
            title="Public targeting"
            description="Blend audiences, shape bid pressure by public, and block groups that should not receive this campaign."
          >
            <div class="grid gap-5 lg:grid-cols-2">
              <div class="space-y-3">
                @for (
                  segment of createCampaignForm.audienceSegments;
                  track segment
                ) {
                  <div class="rounded-md border border-gray-200 p-4">
                    <div
                      class="flex flex-wrap items-start justify-between gap-4"
                    >
                      <label class="flex items-start gap-3">
                        <input
                          type="checkbox"
                          class="mt-1 size-4"
                          [field]="segment.selected"
                        />
                        <span>
                          <span class="block font-bold">{{
                            segment.label().value()
                          }}</span>
                          <span class="block text-sm text-gray-600">
                            {{ segment.description().value() }}
                          </span>
                        </span>
                      </label>
                      <form-field class="min-w-36 flex-col items-start">
                        <form-field-label>Bid adjustment</form-field-label>
                        <input
                          form-field-input
                          [id]="'segmentBid' + segment.id().value()"
                          type="number"
                          [field]="segment.bidAdjustment"
                        />
                      </form-field>
                    </div>
                  </div>
                }
              </div>

              <div
                class="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                <div>
                  <p class="mb-2 text-sm font-bold">Age range</p>
                  <div class="grid grid-cols-2 gap-3">
                    <form-field class="flex-col items-start">
                      <form-field-label>Minimum</form-field-label>
                      <input
                        form-field-input
                        id="minAge"
                        type="number"
                        [field]="createCampaignForm.minAge"
                      />
                    </form-field>
                    <form-field class="flex-col items-start">
                      <form-field-label>Maximum</form-field-label>
                      <input
                        form-field-input
                        id="maxAge"
                        type="number"
                        [field]="createCampaignForm.maxAge"
                      />
                    </form-field>
                  </div>
                </div>

                <fieldset>
                  <legend class="mb-2 text-sm font-bold">Devices</legend>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [field]="createCampaignForm.devices.desktop"
                      />
                      Desktop
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [field]="createCampaignForm.devices.mobile"
                      />
                      Mobile
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [field]="createCampaignForm.devices.tablet"
                      />
                      Tablet
                    </label>
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        [field]="createCampaignForm.devices.connectedTv"
                      />
                      Connected TV
                    </label>
                  </div>
                </fieldset>

                <form-field class="flex-col items-start">
                  <form-field-label>Locations</form-field-label>
                  <textarea
                    form-field-textarea
                    id="locations"
                    rows="4"
                    [field]="createCampaignForm.locations"
                  ></textarea>
                </form-field>

                <form-field class="flex-col items-start">
                  <form-field-label>Exclusions</form-field-label>
                  <textarea
                    form-field-textarea
                    id="exclusions"
                    rows="4"
                    [field]="createCampaignForm.exclusions"
                  ></textarea>
                </form-field>
              </div>
            </div>
          </campaign-section>

          <campaign-section
            eyebrow="Schedule"
            title="Week and day spending windows"
            description="Control when the campaign may spend and how aggressive bidding should be during each window."
          >
            <div class="grid gap-5 xl:grid-cols-2">
              <div>
                <p class="mb-3 text-sm font-bold">Weekly weighting</p>
                <div class="grid gap-2 sm:grid-cols-2">
                  @for (day of createCampaignForm.dayWeights; track day) {
                    <div class="rounded-md border border-gray-200 p-3">
                      <label class="flex items-center justify-between gap-3">
                        <span class="font-semibold">{{
                          day.label().value()
                        }}</span>
                        <input type="checkbox" [field]="day.enabled" />
                      </label>
                      <label class="mt-3 block">
                        <span
                          class="mb-1 block text-xs font-bold uppercase text-gray-500"
                        >
                          Spend weight
                        </span>
                        <input
                          type="range"
                          [field]="day.weight"
                          class="w-full"
                        />
                        <span class="text-sm text-gray-600"
                          >{{ day.weight().value() }}%</span
                        >
                      </label>
                    </div>
                  }
                </div>
              </div>

              <div>
                <p class="mb-3 text-sm font-bold">Daypart rules</p>
                <div class="space-y-3">
                  @for (part of createCampaignForm.dayParts; track part) {
                    <div
                      class="rounded-md border border-gray-200 bg-gray-50 p-4"
                    >
                      <div
                        class="flex flex-wrap items-start justify-between gap-4"
                      >
                        <label class="flex items-start gap-3">
                          <input
                            type="checkbox"
                            class="mt-1 size-4"
                            [field]="part.enabled"
                          />
                          <span>
                            <span class="block font-bold">{{
                              part.label().value()
                            }}</span>
                            <span class="block text-sm text-gray-600">
                              {{ part.hours().value() }}
                            </span>
                          </span>
                        </label>
                        <span class="rounded-full bg-white px-3 py-1 text-sm">
                          {{ part.budgetShare().value() }}% share
                        </span>
                      </div>

                      <div class="mt-4 grid gap-3 md:grid-cols-2">
                        <form-field class="flex-col items-start">
                          <form-field-label>Bid multiplier</form-field-label>
                          <input
                            form-field-input
                            [id]="'bidMultiplier' + part.id().value()"
                            type="number"
                            [field]="part.bidMultiplier"
                            step="0.05"
                          />
                        </form-field>
                        <form-field class="flex-col items-start">
                          <form-field-label>Budget share</form-field-label>
                          <input
                            form-field-input
                            [id]="'budgetShare' + part.id().value()"
                            type="number"
                            [field]="part.budgetShare"
                          />
                        </form-field>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </campaign-section>

          <campaign-section
            eyebrow="Auction logic"
            title="Strategy against other campaigns"
            description="Tell the allocator how this campaign should behave when it competes with your existing campaigns for the same public."
          >
            <div class="grid gap-4 lg:grid-cols-3">
              <form-field class="flex-col items-start">
                <form-field-label>Priority mode</form-field-label>
                <select
                  form-field-select
                  id="priorityMode"
                  [field]="createCampaignForm.priorityMode"
                >
                  <option value="balanced">Balanced rotation</option>
                  <option value="front-run">Front-run this campaign</option>
                  <option value="protect-evergreen">
                    Protect evergreen spend
                  </option>
                  <option value="last-touch">Favor last-touch closers</option>
                </select>
              </form-field>

              <form-field class="flex-col items-start">
                <form-field-label>Priority score</form-field-label>
                <input
                  form-field-input
                  id="priorityScore"
                  type="number"
                  [field]="createCampaignForm.priorityScore"
                />
              </form-field>

              <form-field class="flex-col items-start">
                <form-field-label>Share of voice target</form-field-label>
                <input
                  form-field-input
                  id="shareOfVoiceTarget"
                  type="number"
                  [field]="createCampaignForm.shareOfVoiceTarget"
                />
              </form-field>

              <form-field class="flex-col items-start">
                <form-field-label>Audience overlap policy</form-field-label>
                <select
                  form-field-select
                  id="overlapPolicy"
                  [field]="createCampaignForm.overlapPolicy"
                >
                  <option value="exclude-active">Exclude active buyers</option>
                  <option value="bid-down">Bid down overlaps</option>
                  <option value="highest-priority">
                    Highest priority wins
                  </option>
                  <option value="allow">Allow controlled overlap</option>
                </select>
              </form-field>

              <form-field class="flex-col items-start">
                <form-field-label>Auction strategy</form-field-label>
                <select
                  form-field-select
                  id="auctionStrategy"
                  [field]="createCampaignForm.auctionStrategy"
                >
                  <option value="cost-cap">Cost-cap with learning room</option>
                  <option value="bid-cap">Strict bid cap</option>
                  <option value="value-max">Maximize conversion value</option>
                  <option value="rank-defense">
                    Defend rank against launches
                  </option>
                </select>
              </form-field>

              <form-field class="flex-col items-start">
                <form-field-label>Front-load spend</form-field-label>
                <input
                  form-field-input
                  id="frontloadPercent"
                  type="number"
                  [field]="createCampaignForm.frontloadPercent"
                />
              </form-field>
            </div>

            <div class="mt-5 grid gap-4 lg:grid-cols-3">
              <label
                class="flex items-center gap-2 rounded-md border border-gray-200 p-3"
              >
                <input
                  type="checkbox"
                  [field]="createCampaignForm.cannibalizationGuard"
                />
                Cannibalization guard
              </label>
              <label
                class="flex items-center gap-2 rounded-md border border-gray-200 p-3"
              >
                <input
                  type="checkbox"
                  [field]="createCampaignForm.canBorrowBudget"
                />
                Borrow unspent budget
              </label>
              <form-field class="flex-col items-start">
                <form-field-label
                  >Campaigns to outrank or protect</form-field-label
                >
                <input
                  form-field-input
                  id="competitorCampaigns"
                  [field]="createCampaignForm.competitorCampaigns"
                />
              </form-field>
            </div>
          </campaign-section>

          <campaign-section
            eyebrow="Guardrails"
            title="Automation and stop-loss controls"
            description="Add limits that keep automated spending inside commercial boundaries while the campaign learns."
          >
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label>
                <span class="mb-1 block text-sm font-semibold">Pacing</span>
                <select
                  class="w-full rounded-md border border-gray-300 px-3 py-2"
                  [field]="createCampaignForm.pacing"
                >
                  <option value="even">Even delivery</option>
                  <option value="accelerated">
                    Accelerated early learning
                  </option>
                  <option value="adaptive">Adaptive by conversion lag</option>
                  <option value="manual">Manual release gates</option>
                </select>
              </label>

              <label>
                <span class="mb-1 block text-sm font-semibold">
                  Optimization window
                </span>
                <select
                  class="w-full rounded-md border border-gray-300 px-3 py-2"
                  [field]="createCampaignForm.optimizationWindow"
                >
                  <option value="1d">1 day</option>
                  <option value="7d">7 days</option>
                  <option value="14d">14 days</option>
                  <option value="30d">30 days</option>
                </select>
              </label>

              <label>
                <span class="mb-1 block text-sm font-semibold">Max CAC</span>
                <input
                  type="number"
                  class="w-full rounded-md border border-gray-300 px-3 py-2"
                  [field]="createCampaignForm.kpiGuardrail.maxCac"
                />
              </label>

              <label>
                <span class="mb-1 block text-sm font-semibold"
                  >Minimum ROAS</span
                >
                <input
                  type="number"
                  step="0.1"
                  class="w-full rounded-md border border-gray-300 px-3 py-2"
                  [field]="createCampaignForm.kpiGuardrail.minRoas"
                />
              </label>

              <label>
                <span class="mb-1 block text-sm font-semibold">
                  Stop-loss threshold
                </span>
                <input
                  type="number"
                  class="w-full rounded-md border border-gray-300 px-3 py-2"
                  [field]="createCampaignForm.kpiGuardrail.stopLossPercent"
                />
              </label>

              <label>
                <span class="mb-1 block text-sm font-semibold">
                  Learning budget
                </span>
                <input
                  type="number"
                  class="w-full rounded-md border border-gray-300 px-3 py-2"
                  [field]="createCampaignForm.kpiGuardrail.learningBudget"
                />
              </label>
            </div>
          </campaign-section>
        </div>

        <aside class="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <allocation-health
            [channels]="createCampaignForm.channels().value()"
            [currency]="createCampaignForm.currency().value()"
            [reserveBudget]="createCampaignForm.reserveBudget().value()"
            [totalBudget]="createCampaignForm.totalBudget().value()"
          />

          <div class="rounded-md border border-gray-200 bg-white p-4">
            <p
              class="text-xs font-bold uppercase tracking-widest text-gray-500"
            >
              Launch summary
            </p>
            <dl class="mt-3 space-y-3 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-gray-600">Selected publics</dt>
                <dd class="font-semibold">{{ selectedSegmentCount() }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-600">Active days</dt>
                <dd class="font-semibold">{{ activeDayCount() }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-600">Daypart share</dt>
                <dd class="font-semibold">{{ totalDayPartShare() }}%</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-600">Priority</dt>
                <dd class="font-semibold">
                  {{ createCampaignForm.priorityScore().value() }}/100
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-600">Daily caps</dt>
                <dd class="font-semibold">
                  {{
                    totalDailyCap()
                      | currency
                        : createCampaignForm.currency().value()
                        : 'symbol'
                        : '1.0-0'
                  }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="rounded-md border border-gray-200 bg-white p-4">
            <p
              class="text-xs font-bold uppercase tracking-widest text-gray-500"
            >
              Readiness
            </p>
            <ul class="mt-3 space-y-2 text-sm">
              @for (item of readinessChecks(); track item) {
                <li class="flex items-start gap-2">
                  <span class="mt-1 size-2 rounded-full bg-gray-950"></span>
                  <span>{{ item }}</span>
                </li>
              }
            </ul>
          </div>
        </aside>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCampaignPage {
  private readonly _router = inject(Router);
  private readonly _dashboardStateService = inject(DashboardStateService);
  private readonly _createCampaignStateService = inject(
    CreateCampaignStateService,
  );

  createCampaignForm = this._createCampaignStateService.form();

  readonly channelsWithBudget = computed(() => {
    const state = this._createCampaignStateService.state();
    const spendableBudget = Math.max(
      0,
      state.totalBudget - state.reserveBudget,
    );

    return state.channels.map((channel) => ({
      ...channel,
      budget: channel.enabled
        ? spendableBudget * (Number(channel.allocation || 0) / 100)
        : 0,
    }));
  });

  readonly selectedSegmentCount = computed(
    () =>
      this.createCampaignForm
        .audienceSegments()
        .value()
        .filter((segment) => segment.selected).length,
  );

  readonly activeDayCount = computed(() => {
    const startDate = this.createCampaignForm.startDate().value();
    const endDate = this.createCampaignForm.endDate().value();

    if (!startDate || !endDate) {
      return 0;
    }
    return (
      Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    );
  });

  readonly totalDayPartShare = computed(() =>
    this.createCampaignForm
      .dayParts()
      .value()
      .reduce((sum, part) => sum + (part.enabled ? part.budgetShare : 0), 0),
  );

  readonly totalDailyCap = computed(() =>
    this.createCampaignForm
      .channels()
      .value()
      .reduce((sum, part) => sum + (part.enabled ? part.dailyCap : 0), 0),
  );

  readonly readinessChecks = computed(() => {
    const checks: string[] = [];
    const state = this._createCampaignStateService.state();

    if (!state.name) {
      checks.push('Campaign name is required');
    }
    if (!state.objective) {
      checks.push('Objective is required');
    }
    if (!state.currency) {
      checks.push('Currency is required');
    }
    if (state.totalBudget <= 0) {
      checks.push('Total budget must be greater than 0');
    }
    if (!state.startDate) {
      checks.push('Start date is required');
    }
    if (!state.endDate) {
      checks.push('End date is required');
    }
    if (state.startDate && state.endDate && state.startDate > state.endDate) {
      checks.push('Start date must be before end date');
    }
    if (this.selectedSegmentCount() === 0) {
      checks.push('At least one audience segment must be selected');
    }
    if (this.totalDayPartShare() !== 100) {
      checks.push('Daypart share must equal 100%');
    }

    return checks;
  });

  createCampaign(): void {
    this._createCampaignStateService.submit();
    this._router.navigateByUrl('/dashboard');
  }

  resetPlanning(): void {
    this._createCampaignStateService.reset();
  }
}
