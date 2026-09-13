import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie } from '../_auth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: `Método ${req.method} no permitido.` });
    return;
  }
  clearSessionCookie(req, res);
  res.status(204).end();
}
