import { qlooConfigured, qlooLineup } from "@/lib/qloo";
import type { LineupRequest } from "@/lib/lineup";

export const maxDuration = 60;

// Best-effort per-IP limit (resets on cold start) to protect the shared Qloo quota.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 12;

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_RUNS;
}

export async function POST(req: Request) {
  if (!qlooConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: LineupRequest;
  try {
    body = (await req.json()) as LineupRequest;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const clean = (s: unknown) => String(s ?? "").trim().slice(0, 60);
  const request: LineupRequest = {
    eventName: clean(body.eventName),
    seeds: (body.seeds ?? []).slice(0, 12).map((s) => ({ id: clean(s.id), name: clean(s.name) })),
    entries: (body.entries ?? []).slice(0, 20).map((e) => ({
      id: clean(e.id),
      name: clean(e.name),
      kind: e.kind === "sponsor" ? "sponsor" : "headliner",
    })),
  };
  try {
    return Response.json(await qlooLineup(request));
  } catch {
    return Response.json({ error: "upstream_failed" }, { status: 502 });
  }
}
