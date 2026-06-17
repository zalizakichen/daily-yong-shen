import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    res.status(503).json({ error: "Web Push is not configured on the server." });
    return;
  }

  res.status(200).json({ publicKey });
}
