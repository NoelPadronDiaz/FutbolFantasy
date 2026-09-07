import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PLAYER_COLUMNS, sql, toDto, type PlayerRow } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = (await sql.query(
      `SELECT ${PLAYER_COLUMNS} FROM players ORDER BY created_at DESC`,
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
      `INSERT INTO players (name, position, real_team, purchase_price, purchase_date, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING ${PLAYER_COLUMNS}`,
      [name, position, realTeam || null, purchasePrice, purchaseDate],
    )) as PlayerRow[];

    res.status(201).json(toDto(rows[0]));
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: `Método ${req.method} no permitido.` });
}
