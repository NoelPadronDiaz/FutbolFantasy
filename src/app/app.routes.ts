import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { Balance } from './pages/balance/balance';
import { History } from './pages/history/history';
import { Login } from './pages/login/login';
import { Squad } from './pages/squad/squad';

export const routes: Routes = [
  { path: '', redirectTo: 'plantilla', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'plantilla', component: Squad, canActivate: [authGuard] },
  { path: 'historico', component: History, canActivate: [authGuard] },
  { path: 'balance', component: Balance, canActivate: [authGuard] },
  { path: '**', redirectTo: 'plantilla' },
];
