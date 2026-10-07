import { Routes } from '@angular/router';
import { DashboardPage } from './features/dashboard/dashboard';
import { UserSettingsPage } from './features/user-settings/user-settings';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardPage },
  { path: 'settings', component: UserSettingsPage },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
