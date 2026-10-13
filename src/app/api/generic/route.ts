import { genericConfigured, genericScores } from "@/lib/generic";
import { limited } from "@/lib/ratelimit";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!genericConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  if (limited("generic", req, 12, 200)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: { audience?: string[]; headliners?: string[]; sponsors?: string[] };
  try {
    body = (await req.json()) ?? {};
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
