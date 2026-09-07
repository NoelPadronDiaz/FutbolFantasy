import { Component, computed, inject, signal } from '@angular/core';
import { SortableHeader } from '../../components/sortable-header/sortable-header';
import { EurosPipe } from '../../pipes/euros.pipe';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { SortDirection, compareValues } from '../../utils/sort';

type RankingSortField = 'name' | 'purchasePrice' | 'salePrice' | 'profit';

@Component({
  selector: 'app-balance',
  imports: [EurosPipe, SortableHeader],
  templateUrl: './balance.html',
  styleUrl: './balance.scss',
})
export class Balance {
  private readonly playerService = inject(PlayerService);

  readonly balance = this.playerService.balance;
  readonly freeBalance = this.playerService.freeBalance;
  readonly paidBalance = this.playerService.paidBalance;
  readonly squadInvestment = this.playerService.squadInvestment;
  readonly activeCount = () => this.playerService.activePlayers().length;
  readonly loading = this.playerService.loading;
  readonly error = this.playerService.error;

  sortField = signal<RankingSortField>('profit');
  sortDir = signal<SortDirection>('desc');

  readonly ranking = computed(() => {
    const field = this.sortField();
    const dir = this.sortDir();
    return [...this.playerService.soldPlayers()].sort((a, b) =>
      compareValues(this.sortValue(a, field), this.sortValue(b, field), dir),
    );
  });

  toggleSort(field: string): void {
    const f = field as RankingSortField;
    if (this.sortField() === f) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(f);
      this.sortDir.set('asc');
    }
  }

  private sortValue(player: Player, field: RankingSortField): string | number | undefined {
    switch (field) {
      case 'name':
        return player.name;
      case 'purchasePrice':
        return player.purchasePrice;
      case 'salePrice':
        return player.salePrice;
      case 'profit':
        return this.profit(player);
    }
  }

  profit(player: Player): number {
    return (player.salePrice ?? 0) - player.purchasePrice;
  }
}
