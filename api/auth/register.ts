import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { setSessionCookie, signSession } from '../_auth.js';
import { sql } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: `Método ${req.method} no permitido.` });
    return;
  }

  const { email, password } = req.body ?? {};
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8
  ) {
    res.status(400).json({ error: 'Email inválido o contraseña demasiado corta (mínimo 8 caracteres).' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = (await sql.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])) as {
    id: string;
  }[];
  if (existing.length > 0) {
    res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
    return;
  }

  const [{ count }] = (await sql.query('SELECT COUNT(*)::int AS count FROM users')) as { count: number }[];
  const isFirstUser = count === 0;

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = (await sql.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [normalizedEmail, passwordHash],
  )) as { id: string; email: string }[];

  if (isFirstUser) {
    await sql.query('UPDATE players SET user_id = $1 WHERE user_id IS NULL', [user.id]);
  }

  const token = signSession({ sub: user.id, email: user.email });
  setSessionCookie(req, res, token);
  res.status(201).json({ id: user.id, email: user.email });
}
