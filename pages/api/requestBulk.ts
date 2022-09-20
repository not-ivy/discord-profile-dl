import type { NextApiRequest, NextApiResponse } from 'next';
import DiscordUser from '../../types/discord';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idList, captcha } = JSON.parse(req.body);
  if (!process.env.RECAPTCHA_SECRET) return res.status(500).json({ success: false, error: 'reCAPTCHA not setup correctly' });
  if (!captcha) return res.status(401).json({ success: false, error: 'No reCAPTCHA token provided' });

  const verifyCaptcha = await (await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: captcha.toString() }).toString()
  })).json()
  console.log(verifyCaptcha)
  if (!verifyCaptcha.success) return res.status(401).json({ success: false, error: 'Failed reCAPTCHA' });

  if (!Array.isArray(idList)) return res.status(200).json(await lookUpDiscord(idList));
  return res.status(200).json(await lookupBulk(idList));
}

async function lookupBulk(idList: string[]) {
  const uniqueList = idList.filter((id, index) => idList.indexOf(id) === index);
  const result = [];
  let user: DiscordUser;
  for (const id of uniqueList) {
    try {
      user = await lookUpDiscord(id);
    } catch (e) {
      result.push({ id: id, success: false })
      continue
    }
    result.push({success: true, ...user})
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