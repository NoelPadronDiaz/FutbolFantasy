import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_auth.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: `Método ${req.method} no permitido.` });
    return;
  }

  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  res.status(200).json({ id: session.sub, email: session.email });
}
