import { Component, inject, signal } from '@angular/core';
import { EditPlayerDialog } from '../../components/edit-player-dialog/edit-player-dialog';
import { EurosPipe } from '../../pipes/euros.pipe';
import { NewPlayerInput, Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-history',
  imports: [EurosPipe, EditPlayerDialog],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  private readonly playerService = inject(PlayerService);

  readonly players = this.playerService.soldPlayers;
  readonly loading = this.playerService.loading;
  readonly error = this.playerService.error;

  editingPlayer = signal<Player | null>(null);
  saving = signal(false);

  profit(player: Player): number {
    return (player.salePrice ?? 0) - player.purchasePrice;
  }

  openEditDialog(player: Player): void {
    this.editingPlayer.set(player);
  }

  closeEditDialog(): void {
    this.editingPlayer.set(null);
  }

  async saveEdit(input: NewPlayerInput): Promise<void> {
    const player = this.editingPlayer();
    if (!player) {
      return;
    }
    this.saving.set(true);
    try {
      await this.playerService.editPlayer(player.id, input);
      this.closeEditDialog();
    } catch {
      alert('No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      this.saving.set(false);
    }
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
