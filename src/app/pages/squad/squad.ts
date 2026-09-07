import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditPlayerDialog } from '../../components/edit-player-dialog/edit-player-dialog';
import { EurosPipe } from '../../pipes/euros.pipe';
import { NewPlayerInput, PLAYER_POSITIONS, Player, PlayerPosition } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-squad',
  imports: [FormsModule, EurosPipe, EditPlayerDialog],
  templateUrl: './squad.html',
  styleUrl: './squad.scss',
})
export class Squad {
  private readonly playerService = inject(PlayerService);

  readonly positions = PLAYER_POSITIONS;
  readonly players = this.playerService.activePlayers;
  readonly loading = this.playerService.loading;
  readonly error = this.playerService.error;

  showAddForm = signal(false);
  saving = signal(false);
  newName = '';
  newPosition: PlayerPosition = 'Delantero';
  newRealTeam = '';
  newPrice: number | null = null;
  newDate = today();

  sellingPlayer = signal<Player | null>(null);
  saleDate = today();
  salePrice: number | null = null;

  editingPlayer = signal<Player | null>(null);

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
  }

  async addPlayer(): Promise<void> {
    if (!this.newName.trim() || this.newPrice === null || this.newPrice < 0) {
      return;
    }
    this.saving.set(true);
    try {
      await this.playerService.addPlayer({
        name: this.newName.trim(),
        position: this.newPosition,
        realTeam: this.newRealTeam.trim() || undefined,
        purchasePrice: this.newPrice,
        purchaseDate: this.newDate,
      });
      this.newName = '';
      this.newRealTeam = '';
      this.newPrice = null;
      this.newDate = today();
      this.newPosition = 'Delantero';
      this.showAddForm.set(false);
    } catch {
      alert('No se pudo guardar el fichaje. Inténtalo de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  openSellDialog(player: Player): void {
    this.sellingPlayer.set(player);
    this.saleDate = today();
    this.salePrice = player.purchasePrice;
  }

  closeSellDialog(): void {
    this.sellingPlayer.set(null);
  }

  async confirmSell(): Promise<void> {
    const player = this.sellingPlayer();
    if (!player || this.salePrice === null || this.salePrice < 0) {
      return;
    }
    this.saving.set(true);
    try {
      await this.playerService.sellPlayer(player.id, this.salePrice, this.saleDate);
      this.closeSellDialog();
    } catch {
      alert('No se pudo registrar la venta. Inténtalo de nuevo.');
    } finally {
      this.saving.set(false);
    }
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

  async deletePlayer(player: Player): Promise<void> {
    if (!confirm(`¿Eliminar a ${player.name} de la plantilla? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await this.playerService.deletePlayer(player.id);
    } catch {
      alert('No se pudo eliminar al jugador. Inténtalo de nuevo.');
    }
  }
}
