import { genericConfigured, genericScores } from "@/lib/generic";

export const maxDuration = 60;

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 12;

export async function POST(req: Request) {
  if (!genericConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (recent.length > MAX_RUNS) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: { audience?: string[]; headliners?: string[]; sponsors?: string[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const list = (a: unknown, n: number) => (Array.isArray(a) ? a.slice(0, n).map((s) => String(s).trim().slice(0, 60)) : []);
  try {
    const scores = await genericScores(list(body.audience, 12), list(body.headliners, 20), list(body.sponsors, 20));
    return Response.json({ scores });
  } catch (e) {
    console.error("generic failed:", e instanceof Error ? e.message : e);
    return Response.json({ error: "upstream_failed" }, { status: 502 });
  }
}
