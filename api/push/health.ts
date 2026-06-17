import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  res.status(200).json({
    ok: true,
    redisConfigured: Boolean(url && token),
    envSource: process.env.KV_REST_API_URL
      ? "KV_REST_API_*"
      : process.env.UPSTASH_REDIS_REST_URL
        ? "UPSTASH_REDIS_*"
        : "none",
  });
}
