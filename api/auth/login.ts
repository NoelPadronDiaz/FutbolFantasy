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
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Faltan credenciales.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = (await sql.query('SELECT id, email, password_hash FROM users WHERE email = $1', [
    normalizedEmail,
  ])) as { id: string; email: string; password_hash: string }[];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    return;
  }

  const token = signSession({ sub: user.id, email: user.email });
  setSessionCookie(req, res, token);
  res.status(200).json({ id: user.id, email: user.email });
}
