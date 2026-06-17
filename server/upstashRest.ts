type UpstashConfig = {
  url: string;
  token: string;
};

function getUpstashConfig(): UpstashConfig | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function isUpstashConfigured(): boolean {
  return getUpstashConfig() !== null;
}

async function upstashRequest(body: unknown): Promise<unknown> {
  const config = getUpstashConfig();
  if (!config) {
    throw new Error("Redis is not configured");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: { result?: unknown; error?: string };
  try {
    data = JSON.parse(text) as { result?: unknown; error?: string };
  } catch {
    throw new Error(
      `Upstash request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  if (!response.ok || data.error) {
    throw new Error(
      data.error ??
        `Upstash request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return data.result;
}

export async function upstashCommand(...args: string[]): Promise<unknown> {
  return upstashRequest(args);
}

export async function upstashSetJson(key: string, value: unknown): Promise<void> {
  await upstashCommand("SET", key, JSON.stringify(value));
}

export async function upstashGetJson<T>(key: string): Promise<T | null> {
  const result = await upstashCommand("GET", key);
  if (result === null || result === undefined) return null;
  if (typeof result !== "string") return result as T;
  return JSON.parse(result) as T;
}

export async function upstashSmembers(key: string): Promise<string[]> {
  const result = await upstashCommand("SMEMBERS", key);
  if (!Array.isArray(result)) return [];
  return result.filter((item): item is string => typeof item === "string");
}

export async function upstashDel(key: string): Promise<void> {
  await upstashCommand("DEL", key);
}

export async function upstashSadd(key: string, member: string): Promise<void> {
  await upstashCommand("SADD", key, member);
}

export async function upstashSrem(key: string, member: string): Promise<void> {
  await upstashCommand("SREM", key, member);
}
