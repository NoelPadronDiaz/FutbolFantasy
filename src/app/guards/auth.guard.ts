import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PlayerService } from '../services/player.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const playerService = inject(PlayerService);
  await auth.ensureSessionChecked();
  if (!auth.user()) {
    return router.createUrlTree(['/login']);
  }
  await playerService.refreshIfNeeded();
  return true;
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureSessionChecked();
  return auth.user() ? router.createUrlTree(['/plantilla']) : true;
};
