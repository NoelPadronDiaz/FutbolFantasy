import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

// Cast dates to text so the driver returns 'YYYY-MM-DD' as-is, instead of
// parsing them into a JS Date and shifting the day depending on server timezone.
export const PLAYER_COLUMNS = `id, name, position, real_team, purchase_price,
  purchase_date::text AS purchase_date, sale_price, sale_date::text AS sale_date, status`;

export type PlayerRow = {
  id: string;
  name: string;
  position: string;
  real_team: string | null;
  purchase_price: string;
  purchase_date: string;
  sale_price: string | null;
  sale_date: string | null;
  status: string;
};

export type PlayerDto = {
  id: string;
  name: string;
  position: string;
  realTeam?: string;
  purchasePrice: number;
  purchaseDate: string;
  salePrice?: number;
  saleDate?: string;
  status: string;
};

export function toDto(row: PlayerRow): PlayerDto {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    realTeam: row.real_team ?? undefined,
    purchasePrice: Number(row.purchase_price),
    purchaseDate: row.purchase_date,
    salePrice: row.sale_price !== null ? Number(row.sale_price) : undefined,
    saleDate: row.sale_date ?? undefined,
    status: row.status,
  };
}
