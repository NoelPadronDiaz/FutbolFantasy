import { Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamSelect } from '../team-select/team-select';
import { NewPlayerInput, PLAYER_POSITIONS, Player, PlayerPosition } from '../../models/player.model';

@Component({
  selector: 'app-edit-player-dialog',
  imports: [FormsModule, TeamSelect],
  templateUrl: './edit-player-dialog.html',
})
export class EditPlayerDialog implements OnInit {
  readonly player = input.required<Player>();
  readonly saving = input(false);
  readonly save = output<NewPlayerInput>();
  readonly cancel = output<void>();

  readonly positions = PLAYER_POSITIONS;

  name = '';
  position: PlayerPosition = 'Delantero';
  realTeam: string | undefined = undefined;
  price: number | null = null;
  date = '';

  ngOnInit(): void {
    const player = this.player();
    this.name = player.name;
    this.position = player.position;
    this.realTeam = player.realTeam;
    this.price = player.purchasePrice;
    this.date = player.purchaseDate;
  }

  submit(): void {
    if (!this.name.trim() || this.price === null || this.price < 0) {
      return;
    }
    this.save.emit({
      name: this.name.trim(),
      position: this.position,
      realTeam: this.realTeam,
      purchasePrice: this.price,
      purchaseDate: this.date,
    });
  }
}
