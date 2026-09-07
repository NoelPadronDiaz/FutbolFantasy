import { Component, inject } from '@angular/core';
import { EurosPipe } from '../../pipes/euros.pipe';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-balance',
  imports: [EurosPipe],
  templateUrl: './balance.html',
  styleUrl: './balance.scss',
})
export class Balance {
  private readonly playerService = inject(PlayerService);

  readonly balance = this.playerService.balance;
  readonly squadInvestment = this.playerService.squadInvestment;
  readonly activeCount = () => this.playerService.activePlayers().length;
  readonly loading = this.playerService.loading;
  readonly error = this.playerService.error;

  readonly ranking = () =>
    [...this.playerService.soldPlayers()].sort((a, b) => this.profit(b) - this.profit(a));

  profit(player: Player): number {
    return (player.salePrice ?? 0) - player.purchasePrice;
  }
}
