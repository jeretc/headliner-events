import { qlooConfigured, searchQloo } from "@/lib/qloo";
import { limited } from "@/lib/ratelimit";
import { norm } from "@/lib/normalize";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const q = (p.get("q") ?? "").trim().slice(0, 60);
  const kind = p.get("kind");
  if (q.length < 2 || !qlooConfigured()) return Response.json({ results: [] });
  if (limited("search", req, 150, 2000)) return Response.json({ results: [], error: "rate_limited" }, { status: 429 });
  try {
    const kinds: ("artist" | "brand")[] = kind === "artist" || kind === "brand" ? [kind] : ["artist", "brand"];
    const lists = await Promise.all(kinds.map((k) => searchQloo(q, k, kinds.length > 1 ? 3 : 6)));
    const q2 = norm(q);
    if (q2.length < 2) return Response.json({ results: [] });
    // Drop loose fuzzy hits: keep names that contain what was typed (or the other way round).
    const near = lists.flat().filter((h) => { const hn = norm(h.name); return hn.length >= 2 && (hn.includes(q2) || q2.includes(hn)); });
    const rank = (n: string) => (norm(n) === q2 ? 0 : norm(n).startsWith(q2) ? 1 : 2);
    near.sort((a, b) => rank(a.name) - rank(b.name));
    return Response.json({ results: near.map((h) => ({ name: h.name, kind: h.kind })) });
  } catch {
    return Response.json({ results: [] });
  }
}
