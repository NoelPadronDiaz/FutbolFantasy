import { Routes } from '@angular/router';
import { Balance } from './pages/balance/balance';
import { History } from './pages/history/history';
import { Squad } from './pages/squad/squad';

export const routes: Routes = [
  { path: '', redirectTo: 'plantilla', pathMatch: 'full' },
  { path: 'plantilla', component: Squad },
  { path: 'historico', component: History },
  { path: 'balance', component: Balance },
  { path: '**', redirectTo: 'plantilla' },
];
