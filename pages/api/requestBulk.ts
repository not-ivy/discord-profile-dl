import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query: { idList, captcha } } = req;
  if (!process.env.RECAPTCHA_SECRET) return res.status(500).json({ error: 'reCAPTCHA not setup correctly' });
  if (!captcha) return res.status(401).json({ error: 'No reCAPTCHA token provided' });

  fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: JSON.stringify({
      secret: process.env.RECAPTCHA_SECRET,
      response: captcha,
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return res.status(401).json({ error: 'Failed reCAPTCHA' });
      if (!Array.isArray(idList)) return lookUpDiscord(idList);

      const result = [];
      idList.forEach((id) => result.push(lookUpDiscord(id)));
      return res.status(200).json(result)
    }).catch((error) => res.status(500).json({ error }))
}


function lookUpDiscord(id: string): any {
  fetch(`https://discord.com/api/v9/users/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${process.env.BOT_TOKEN}`,
    }
  }).then((res) => res.json()).then((data) => data)
}