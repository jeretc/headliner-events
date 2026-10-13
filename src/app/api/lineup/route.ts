import { qlooConfigured, qlooLineup } from "@/lib/qloo";
import type { LineupRequest } from "@/lib/lineup";
import { limited } from "@/lib/ratelimit";
import { MAX_ENTRIES, MAX_SEEDS } from "@/lib/lineup";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!qlooConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  if (limited("lineup", req, 12, 200)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: Partial<LineupRequest> | null;
  try {
    body = (await req.json()) as Partial<LineupRequest> | null;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || !Array.isArray(body.seeds) || !Array.isArray(body.entries)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (body.seeds.length > MAX_SEEDS || body.entries.length > MAX_ENTRIES) {
    return Response.json({ error: "too_many", maxSeeds: MAX_SEEDS, maxEntries: MAX_ENTRIES }, { status: 400 });
  }
  const clean = (s: unknown) => String(s ?? "").trim().slice(0, 60);
  const obj = <T,>(x: unknown) => (x && typeof x === "object" ? (x as T) : ({} as T));
  const request: LineupRequest = {
    eventName: clean(body.eventName),
    seeds: body.seeds.map((s) => ({ id: clean(obj<{ id?: string }>(s).id), name: clean(obj<{ name?: string }>(s).name) })),
    entries: body.entries.map((e) => {
      const o = obj<{ id?: string; name?: string; kind?: string }>(e);
      return { id: clean(o.id), name: clean(o.name), kind: o.kind === "sponsor" ? ("sponsor" as const) : ("headliner" as const) };
    }),
  };
  // Blank names (whitespace only) are dropped rather than reported as "not found".
  request.seeds = request.seeds.filter((s) => s.name !== "");
  request.entries = request.entries.filter((e) => e.name !== "");
  if (!request.seeds.length || !request.entries.length) return Response.json({ error: "bad_request" }, { status: 400 });
  try {
    return Response.json(await qlooLineup(request));
  } catch (e) {
    console.error("lineup failed:", e instanceof Error ? e.message : e);
    return Response.json({ error: "upstream_failed" }, { status: 502 });
  }
}
