import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query: { idList, captcha } } = req;
  if (!process.env.RECAPTCHA_SECRET) return res.status(500).json({ error: 'reCAPTCHA not setup correctly' });
  if (!captcha) return res.status(401).json({ error: 'No reCAPTCHA token provided' });

  const verifyCaptcha = await (await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: captcha.toString() }).toString()
  })).json()
  console.log(verifyCaptcha)
  if (!verifyCaptcha.success) return res.status(401).json({ error: 'Failed reCAPTCHA' });

  if (!Array.isArray(idList)) return res.status(200).json(await lookUpDiscord(idList));
  return res.status(200).json(await lookupBulk(idList));
}

async function lookupBulk(idList: string[]) {
  const result = [];
  for (const id of idList) {
    const user = await lookUpDiscord(id)
    result.push(user)
  }
  return result;
}

async function lookUpDiscord(id: string) {
  return (await fetch(`https://discord.com/api/v9/users/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${process.env.BOT_TOKEN}`,
    }
  })).json();
}