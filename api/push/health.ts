import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isKvConfigured } from "../_lib/pushStore";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    redisConfigured: isKvConfigured(),
  });
}
