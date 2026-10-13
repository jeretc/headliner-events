import { qlooConfigured, searchQloo } from "@/lib/qloo";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const q = (p.get("q") ?? "").trim().slice(0, 60);
  const kind = p.get("kind");
  if (!q || !qlooConfigured()) return Response.json({ results: [] });
  try {
    const kinds: ("artist" | "brand")[] = kind === "artist" || kind === "brand" ? [kind] : ["artist", "brand"];
    const lists = await Promise.all(kinds.map((k) => searchQloo(q, k, kinds.length > 1 ? 3 : 6)));
    const q2 = q.toLowerCase();
    // Drop loose fuzzy hits: keep names that contain what was typed (or the other way round).
    const near = lists.flat().filter((h) => h.name.toLowerCase().includes(q2) || q2.includes(h.name.toLowerCase()));
    const rank = (n: string) => (n.toLowerCase() === q2 ? 0 : n.toLowerCase().startsWith(q2) ? 1 : 2);
    near.sort((a, b) => rank(a.name) - rank(b.name));
    return Response.json({ results: near.map((h) => ({ name: h.name, kind: h.kind })) });
  } catch {
    return Response.json({ results: [] });
  }
}
