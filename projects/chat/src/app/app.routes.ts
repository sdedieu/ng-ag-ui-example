import { Routes } from '@angular/router';
import { HomePage } from './features/home/home';
import { UserSettingsPage } from './features/user-settings/user-settings';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'settings', component: UserSettingsPage },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
];
