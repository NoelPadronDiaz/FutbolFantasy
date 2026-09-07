import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NewPlayerInput, Player } from '../models/player.model';

const API_URL = '/api/players';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);

  private readonly playersSignal = signal<Player[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly players = this.playersSignal.asReadonly();

  readonly activePlayers = computed(() => this.playersSignal().filter((p) => p.status === 'active'));

  readonly soldPlayers = computed(() => this.playersSignal().filter((p) => p.status === 'sold'));

  readonly squadInvestment = computed(() =>
    this.activePlayers().reduce((sum, p) => sum + p.purchasePrice, 0),
  );

  readonly balance = computed(() => {
    const sold = this.soldPlayers();
    const totalCost = sold.reduce((sum, p) => sum + p.purchasePrice, 0);
    const totalRevenue = sold.reduce((sum, p) => sum + (p.salePrice ?? 0), 0);
    const net = totalRevenue - totalCost;
    const wins = sold.filter((p) => (p.salePrice ?? 0) > p.purchasePrice).length;
    const losses = sold.filter((p) => (p.salePrice ?? 0) < p.purchasePrice).length;
    const flat = sold.length - wins - losses;
    return { totalCost, totalRevenue, net, wins, losses, flat, count: sold.length };
  });

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const players = await firstValueFrom(this.http.get<Player[]>(API_URL));
      this.playersSignal.set(players);
    } catch {
      this.error.set('No se pudo conectar con la base de datos.');
    } finally {
      this.loading.set(false);
    }
  }

  async addPlayer(input: NewPlayerInput): Promise<void> {
    const created = await firstValueFrom(this.http.post<Player>(API_URL, input));
    this.playersSignal.update((players) => [created, ...players]);
  }

  async sellPlayer(id: string, salePrice: number, saleDate: string): Promise<void> {
    const updated = await firstValueFrom(
      this.http.patch<Player>(API_URL, { action: 'sell', salePrice, saleDate }, { params: { id } }),
    );
    this.playersSignal.update((players) => players.map((p) => (p.id === id ? updated : p)));
  }

  async editPlayer(id: string, input: NewPlayerInput): Promise<void> {
    const updated = await firstValueFrom(
      this.http.patch<Player>(API_URL, { action: 'edit', ...input }, { params: { id } }),
    );
    this.playersSignal.update((players) => players.map((p) => (p.id === id ? updated : p)));
  }

  async restorePlayer(id: string): Promise<void> {
    const updated = await firstValueFrom(
      this.http.patch<Player>(API_URL, { action: 'restore' }, { params: { id } }),
    );
    this.playersSignal.update((players) => players.map((p) => (p.id === id ? updated : p)));
  }

  async deletePlayer(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(API_URL, { params: { id } }));
    this.playersSignal.update((players) => players.filter((p) => p.id !== id));
  }
}
