export type PlayerPosition = 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero';

export const PLAYER_POSITIONS: PlayerPosition[] = [
  'Portero',
  'Defensa',
  'Centrocampista',
  'Delantero',
];

export type PlayerStatus = 'active' | 'sold';

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  realTeam?: string;
  purchasePrice: number;
  purchaseDate: string;
  salePrice?: number;
  saleDate?: string;
  status: PlayerStatus;
}

export interface NewPlayerInput {
  name: string;
  position: PlayerPosition;
  realTeam?: string;
  purchasePrice: number;
  purchaseDate: string;
}
