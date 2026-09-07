import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PLAYER_COLUMNS, sql, toDto, type PlayerRow } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Id inválido.' });
    return;
  }

  if (req.method === 'PATCH') {
    const { action, salePrice, saleDate } = req.body ?? {};

    let rows: PlayerRow[];

    if (action === 'sell') {
      if (salePrice === undefined || !saleDate) {
        res.status(400).json({ error: 'Faltan salePrice o saleDate.' });
        return;
      }
      rows = (await sql.query(
        `UPDATE players
         SET status = 'sold', sale_price = $2, sale_date = $3
         WHERE id = $1
         RETURNING ${PLAYER_COLUMNS}`,
        [id, salePrice, saleDate],
      )) as PlayerRow[];
    } else if (action === 'restore') {
      rows = (await sql.query(
        `UPDATE players
         SET status = 'active', sale_price = NULL, sale_date = NULL
         WHERE id = $1
         RETURNING ${PLAYER_COLUMNS}`,
        [id],
      )) as PlayerRow[];
    } else {
      res.status(400).json({ error: "action debe ser 'sell' o 'restore'." });
      return;
    }

    if (rows.length === 0) {
      res.status(404).json({ error: 'Jugador no encontrado.' });
      return;
    }

    res.status(200).json(toDto(rows[0]));
    return;
  }

  if (req.method === 'DELETE') {
    const rows = (await sql.query('DELETE FROM players WHERE id = $1 RETURNING id', [id])) as { id: string }[];
    if (rows.length === 0) {
      res.status(404).json({ error: 'Jugador no encontrado.' });
      return;
    }
    res.status(204).end();
    return;
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: `Método ${req.method} no permitido.` });
}
