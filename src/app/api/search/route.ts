import { qlooConfigured, searchQloo } from "@/lib/qloo";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const q = (p.get("q") ?? "").trim().slice(0, 60);
  const kind = p.get("kind");
  if (!q || !qlooConfigured()) return Response.json({ results: [] });
  try {
    const kinds: ("artist" | "brand")[] = kind === "artist" || kind === "brand" ? [kind] : ["artist", "brand"];
    const lists = await Promise.all(kinds.map((k) => searchQloo(q, k, kinds.length > 1 ? 3 : 6)));
    return Response.json({ results: lists.flat().map((h) => ({ name: h.name, kind: h.kind })) });
  } catch {
    return Response.json({ results: [] });
  }
}
