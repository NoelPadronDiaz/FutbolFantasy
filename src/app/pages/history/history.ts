import { Component, computed, inject, signal } from '@angular/core';
import { EditPlayerDialog } from '../../components/edit-player-dialog/edit-player-dialog';
import { SortableHeader } from '../../components/sortable-header/sortable-header';
import { EurosPipe } from '../../pipes/euros.pipe';
import { NewPlayerInput, Player } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';
import { SortDirection, compareValues } from '../../utils/sort';

type HistorySortField =
  | 'name'
  | 'position'
  | 'purchasePrice'
  | 'salePrice'
  | 'purchaseDate'
  | 'saleDate'
  | 'profit';

@Component({
  selector: 'app-history',
  imports: [EurosPipe, EditPlayerDialog, SortableHeader],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  private readonly playerService = inject(PlayerService);

  readonly loading = this.playerService.loading;
  readonly error = this.playerService.error;

  editingPlayer = signal<Player | null>(null);
  saving = signal(false);

  sortField = signal<HistorySortField>('saleDate');
  sortDir = signal<SortDirection>('desc');

  readonly players = computed(() => {
    const field = this.sortField();
    const dir = this.sortDir();
    return [...this.playerService.soldPlayers()].sort((a, b) =>
      compareValues(this.sortValue(a, field), this.sortValue(b, field), dir),
    );
  });

  toggleSort(field: string): void {
    const f = field as HistorySortField;
    if (this.sortField() === f) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(f);
      this.sortDir.set('asc');
    }
  }

  private sortValue(player: Player, field: HistorySortField): string | number | undefined {
    switch (field) {
      case 'name':
        return player.name;
      case 'position':
        return player.position;
      case 'purchasePrice':
        return player.purchasePrice;
      case 'salePrice':
        return player.salePrice;
      case 'purchaseDate':
        return player.purchaseDate;
      case 'saleDate':
        return player.saleDate;
      case 'profit':
        return this.profit(player);
    }
  }

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
