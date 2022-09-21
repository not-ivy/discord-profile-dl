import type { NextApiRequest, NextApiResponse } from 'next';
import type { DiscordUser, DiscordResponse } from '../../types/discord';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idList, captcha } = JSON.parse(req.body);
  if (!process.env.RECAPTCHA_SECRET) return res.status(500).json({ status: { success: false, error: 'reCAPTCHA not setup correctly' }, response: undefined });
  if (!captcha) return res.status(401).json({ status: { success: false, error: 'No reCAPTCHA token provided' }, respnse: undefined });

  const verifyCaptcha = await (await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: captcha.toString() }).toString()
  })).json()
  console.log(verifyCaptcha)
  if (!verifyCaptcha.success) return res.status(401).json({ status: { success: false, error: 'Failed reCAPTCHA' }, response: undefined });

  if (!Array.isArray(idList)) return res.status(200).json(await lookUpDiscord(idList));
  return res.status(200).json(await lookupBulk(idList));
}

async function lookupBulk(idList: string[]) {
  const uniqueList = idList.filter((id, index) => idList.indexOf(id) === index);
  const result: DiscordUser[] = [];
  let user: DiscordResponse;
  for (const id of uniqueList) {
    try {
      user = await lookUpDiscord(id);
    } catch (e: any) {
      result.push({ status: { success: false, error: e.toString() }, response: undefined })
      continue
    }
    if (user.message) {
      result.push({ status: { success: false, error: user.message }, response: user });
      continue
    }
    result.push({ status: { success: true, error: undefined }, response: user })
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