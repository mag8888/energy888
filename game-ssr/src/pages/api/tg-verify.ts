import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Verify Telegram login payload on server
// Docs: https://core.telegram.org/widgets/login#checking-authorization

function checkTelegramAuth(data: Record<string, string>, botToken: string) {
  const authData = { ...data };
  const hash = authData.hash;
  delete authData.hash;

  const secret = crypto.createHash('sha256').update(botToken).digest();
  const checkString = Object.keys(authData)
    .sort()
    .map(k => `${k}=${authData[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === hash;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ ok: false, error: 'BOT_TOKEN not configured' });
  }

  const data: Record<string, string> = {} as any;
  Object.keys(req.query).forEach(k => {
    const v = req.query[k];
    if (Array.isArray(v)) data[k] = v[0];
    else if (typeof v === 'string') data[k] = v;
  });

  try {
    const ok = checkTelegramAuth(data, botToken);
    if (!ok) return res.status(401).json({ ok: false, error: 'Invalid hash' });
    return res.status(200).json({ ok: true, user: data });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || 'Bad request' });
  }
}

