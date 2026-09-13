import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth.js';
import { PLAYER_COLUMNS, sql, toDto, type PlayerRow } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireAuth(req, res);
  if (!session) {
    return;
  }
  const userId = session.sub;

  if (req.method === 'GET') {
    const rows = (await sql.query(
      `SELECT ${PLAYER_COLUMNS} FROM players WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )) as PlayerRow[];
    res.status(200).json(rows.map(toDto));
    return;
  }

  if (req.method === 'POST') {
    const { name, position, realTeam, purchasePrice, purchaseDate } = req.body ?? {};

    if (!name || !position || purchasePrice === undefined || !purchaseDate) {
      res.status(400).json({ error: 'Faltan campos obligatorios: name, position, purchasePrice, purchaseDate.' });
      return;
    }

    const rows = (await sql.query(
      `INSERT INTO players (user_id, name, position, real_team, purchase_price, purchase_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING ${PLAYER_COLUMNS}`,
      [userId, name, position, realTeam || null, purchasePrice, purchaseDate],
    )) as PlayerRow[];

    res.status(201).json(toDto(rows[0]));
    return;
  }

  if (req.method === 'PATCH' || req.method === 'DELETE') {
    const { id } = req.query;
    if (typeof id !== 'string') {
      res.status(400).json({ error: 'Falta el parámetro id.' });
      return;
    }

    if (req.method === 'DELETE') {
      const rows = (await sql.query('DELETE FROM players WHERE id = $1 AND user_id = $2 RETURNING id', [
        id,
        userId,
      ])) as { id: string }[];
      if (rows.length === 0) {
        res.status(404).json({ error: 'Jugador no encontrado.' });
        return;
      }
      res.status(204).end();
      return;
    }

    const { action, salePrice, saleDate } = req.body ?? {};

    let rows: PlayerRow[];

    if (action === 'sell') {
      if (salePrice === undefined || !saleDate) {
        res.status(400).json({ error: 'Faltan salePrice o saleDate.' });
        return;
      }
      rows = (await sql.query(
        `UPDATE players
         SET status = 'sold', sale_price = $3, sale_date = $4
         WHERE id = $1 AND user_id = $2
         RETURNING ${PLAYER_COLUMNS}`,
        [id, userId, salePrice, saleDate],
      )) as PlayerRow[];
    } else if (action === 'restore') {
      rows = (await sql.query(
        `UPDATE players
         SET status = 'active', sale_price = NULL, sale_date = NULL
         WHERE id = $1 AND user_id = $2
         RETURNING ${PLAYER_COLUMNS}`,
        [id, userId],
      )) as PlayerRow[];
    } else if (action === 'edit') {
      const { name, position, realTeam, purchasePrice, purchaseDate } = req.body ?? {};
      if (!name || !position || purchasePrice === undefined || !purchaseDate) {
        res.status(400).json({ error: 'Faltan campos obligatorios: name, position, purchasePrice, purchaseDate.' });
        return;
      }
      rows = (await sql.query(
        `UPDATE players
         SET name = $3, position = $4, real_team = $5, purchase_price = $6, purchase_date = $7
         WHERE id = $1 AND user_id = $2
         RETURNING ${PLAYER_COLUMNS}`,
        [id, userId, name, position, realTeam || null, purchasePrice, purchaseDate],
      )) as PlayerRow[];
    } else {
      res.status(400).json({ error: "action debe ser 'sell', 'restore' o 'edit'." });
      return;
    }

    if (rows.length === 0) {
      res.status(404).json({ error: 'Jugador no encontrado.' });
      return;
    }

    res.status(200).json(toDto(rows[0]));
    return;
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  res.status(405).json({ error: `Método ${req.method} no permitido.` });
}
