import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'dashboard', loadComponent: async () => (await import('./features/dashboard/dashboard')).DashboardPage },
  { path: 'create-campaign', loadComponent: async () => (await import ('./features/create-campaign/create-campaign')).CreateCampaignPage },
  { path: 'settings', loadComponent: async () => (await import('./features/user-settings/user-settings')).UserSettingsPage },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
