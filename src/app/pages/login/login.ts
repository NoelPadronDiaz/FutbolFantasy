import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly playerService = inject(PlayerService);
  private readonly router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  saving = signal(false);
  error = signal<string | null>(null);

  toggleMode(): void {
    this.mode.update((m) => (m === 'login' ? 'register' : 'login'));
    this.error.set(null);
  }

  async submit(): Promise<void> {
    if (!this.email.trim() || this.password.length < 8) {
      this.error.set('Introduce un email válido y una contraseña de al menos 8 caracteres.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      if (this.mode() === 'login') {
        await this.auth.login(this.email.trim(), this.password);
      } else {
        await this.auth.register(this.email.trim(), this.password);
      }
      await this.playerService.refresh();
      this.router.navigateByUrl('/plantilla');
    } catch {
      this.error.set(
        this.mode() === 'login'
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo crear la cuenta (puede que el email ya esté registrado).',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
