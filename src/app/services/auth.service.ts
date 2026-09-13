import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';

const API_URL = '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<User | null>(null);
  readonly checked = signal(false);

  private sessionCheck: Promise<void> | null = null;

  ensureSessionChecked(): Promise<void> {
    if (!this.sessionCheck) {
      this.sessionCheck = this.checkSession();
    }
    return this.sessionCheck;
  }

  private async checkSession(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<User>(`${API_URL}/me`));
      this.user.set(user);
    } catch {
      this.user.set(null);
    } finally {
      this.checked.set(true);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const user = await firstValueFrom(this.http.post<User>(`${API_URL}/login`, { email, password }));
    this.user.set(user);
  }

  async register(email: string, password: string): Promise<void> {
    const user = await firstValueFrom(this.http.post<User>(`${API_URL}/register`, { email, password }));
    this.user.set(user);
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${API_URL}/logout`, {}));
    this.user.set(null);
  }
}
