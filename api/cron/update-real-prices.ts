import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_auth.js';
import { sql } from '../_db.js';

const PLAYERS_API_URL = 'https://fantasy-api.llt-services.com/api/v1/competition/1/players?x-lang=es';
const COMBINING_MARKS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');

type ApiPlayer = {
  id: string;
  nickname: string;
  marketValue: string;
};

function normalizeName(name: string): string {
  return name.normalize('NFD').replace(COMBINING_MARKS_REGEX, '').toLowerCase().trim();
}

function isAuthorized(req: VercelRequest): boolean {
  const host = req.headers.host ?? '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return true;
  }
  if (getSession(req)) {
    return true;
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }
  return req.headers.authorization === `Bearer ${secret}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'No autorizado.' });
    return;
  }

  try {
    const apiRes = await fetch(PLAYERS_API_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!apiRes.ok) {
      res.status(502).json({ error: `La API de LaLiga Fantasy respondió ${apiRes.status}.` });
      return;
    }
    const apiPlayers = (await apiRes.json()) as ApiPlayer[];

    const valueByName = new Map<string, number>();
    for (const p of apiPlayers) {
      const value = Number(p.marketValue);
      if (p.nickname && Number.isFinite(value)) {
        valueByName.set(normalizeName(p.nickname), value);
      }
    }

    const ourPlayers = (await sql.query('SELECT id, name, real_price FROM players')) as {
      id: string;
      name: string;
      real_price: string | null;
    }[];

    let matched = 0;
    let updated = 0;
    let failed = 0;

    for (const player of ourPlayers) {
      const value = valueByName.get(normalizeName(player.name));
      if (value === undefined) {
        continue;
      }
      matched += 1;
      const currentValue = player.real_price !== null ? Number(player.real_price) : null;
      if (currentValue === value) {
        continue;
      }
      try {
        await sql.query('UPDATE players SET real_price = $2 WHERE id = $1', [player.id, value]);
        updated += 1;
      } catch (err) {
        failed += 1;
        console.error(`No se pudo actualizar real_price de "${player.name}" (${player.id}):`, err);
      }
    }

    res.status(200).json({
      totalApiPlayers: apiPlayers.length,
      totalOurPlayers: ourPlayers.length,
      matched,
      updated,
      failed,
    });
  } catch (err) {
    console.error('Error actualizando valores reales:', err);
    res.status(500).json({ error: 'No se pudieron actualizar los valores reales.' });
  }
}
