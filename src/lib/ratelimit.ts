// Best-effort in-memory limiter (per server instance) to protect the shared Qloo and Gemini quotas.
// It is a guard rail, not a security boundary: a determined caller can still spread load across instances.
const windows = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;

function hit(key: string, max: number, now: number) {
  const recent = (windows.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  windows.set(key, recent);
  return recent.length > max;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** True when the caller (per IP) or the whole bucket (global) is over its limit. */
export function limited(bucket: string, req: Request, perIp: number, global: number) {
  const now = Date.now();
  if (windows.size > 5000) for (const [k, v] of windows) if (!v.some((t) => now - t < WINDOW_MS)) windows.delete(k);
  const ipOver = hit(`${bucket}:${clientIp(req)}`, perIp, now);
  const allOver = hit(`${bucket}:*`, global, now);
  return ipOver || allOver;
}
