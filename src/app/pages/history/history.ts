import { Component, inject } from '@angular/core';
import { EurosPipe } from '../../pipes/euros.pipe';
import { Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-history',
  imports: [EurosPipe],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  private readonly playerService = inject(PlayerService);

  readonly players = this.playerService.soldPlayers;
  readonly loading = this.playerService.loading;
  readonly error = this.playerService.error;

  profit(player: Player): number {
    return (player.salePrice ?? 0) - player.purchasePrice;
  }

  async restore(player: Player): Promise<void> {
    if (!confirm(`¿Volver a poner a ${player.name} en tu plantilla activa?`)) {
      return;
    }
    try {
      await this.playerService.restorePlayer(player.id);
    } catch {
      alert('No se pudo recuperar al jugador. Inténtalo de nuevo.');
    }
  }

  async remove(player: Player): Promise<void> {
    if (!confirm(`¿Eliminar a ${player.name} del histórico? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await this.playerService.deletePlayer(player.id);
    } catch {
      alert('No se pudo eliminar al jugador. Inténtalo de nuevo.');
    }
  }
}
