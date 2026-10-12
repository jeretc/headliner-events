import { candidates as demoCandidates, event as demoEvent, type Candidate } from "./mock-report";

export type Seed = { id: string; name: string };
export type Entry = { id: string; name: string; kind: "headliner" | "sponsor" };
export type LineupRequest = { eventName: string; seeds: Seed[]; entries: Entry[] };
export type Step = { tag: "Resolve" | "Signals" | "Rank"; text: string; result?: string };
export type LineupResult = {
  request: LineupRequest;
  candidates: Candidate[];
  steps: Step[];
  source: "mock";
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const demoRequest: LineupRequest = {
  eventName: demoEvent.name,
  seeds: demoEvent.seeds.map((name) => ({ id: slug(name), name })),
  entries: demoCandidates.map((c) => ({ id: c.id, name: c.name, kind: c.kind })),
};

// PLACEHOLDER suggestions; replaced by Qloo /search once the key is available.
const artists = [
  "Tame Impala", "Fred again..", "Glass Animals", "Khruangbin", "Bonobo", "Billie Eilish", "Post Malone",
  "The Weeknd", "Radiohead", "Four Tet", "Caribou", "Mac DeMarco", "Arctic Monkeys", "Dua Lipa", "Kendrick Lamar",
  "Jungle", "Disclosure", "Beach House", "Phoebe Bridgers", "Daft Punk",
];
const brands = [
  "Aesop", "Patagonia", "Spotify", "Lululemon", "Red Bull", "Harley-Davidson", "Heineken", "Coca-Cola", "Nike",
  "Oatly", "Allbirds", "Corona", "Monster Energy", "Rolex", "Apple", "Levi's", "Vans", "Stella Artois", "Tesla", "Notion",
];

export function searchEntities(query: string, kind: "artist" | "brand" | "any"): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool = kind === "artist" ? artists : kind === "brand" ? brands : [...artists, ...brands];
  return pool.filter((n) => n.toLowerCase().includes(q)).slice(0, 6);
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
const clamp = (n: number) => Math.max(5, Math.min(99, n));

function mockCandidate(e: Entry): Candidate {
  const h = hash(e.name.toLowerCase());
  const fit = 28 + (h % 66);
  const verdict =
    fit >= 80 ? (e.kind === "headliner" ? "Book" : "Sponsor") : fit >= 60 ? "Consider" : "Avoid";
  const labels = e.kind === "headliner"
    ? ["Artist affinity", "Brand overlap", "Lifestyle fit"]
    : ["Brand overlap", "Lifestyle fit", "Artist affinity"];
  return {
    id: e.id,
    name: e.name,
    kind: e.kind,
    fit,
    verdict,
    why: "Placeholder reasoning. With a Qloo key connected, this explains the fit using real taste-graph signals for your audience.",
    signals: labels.map((label, i) => ({
      label,
      strength: clamp(fit + ((h >> (i * 3 + 2)) % 17) - 8),
      note: "Mock signal, replaced by Qloo data",
    })),
  };
}

// Single entry point for the UI. Swap the body for real Qloo calls later.
export async function getLineup(request: LineupRequest): Promise<LineupResult> {
  const demoByName = new Map(demoCandidates.map((c) => [c.name.toLowerCase(), c]));
  const all = request.entries.map((e) => demoByName.get(e.name.toLowerCase()) ?? mockCandidate(e));
  const sorted = [
    ...all.filter((c) => c.kind === "headliner").sort((a, b) => b.fit - a.fit),
    ...all.filter((c) => c.kind === "sponsor").sort((a, b) => b.fit - a.fit),
  ];
  const steps: Step[] = [
    ...request.seeds.map((s) => ({ tag: "Resolve" as const, text: s.name, result: "entity matched" })),
    ...sorted.map((c) => ({ tag: "Signals" as const, text: c.name, result: `${c.signals.length} signals pulled` })),
    ...sorted.map((c) => ({ tag: "Rank" as const, text: c.name, result: `${c.fit} · ${c.verdict}` })),
  ];
  return { request, candidates: sorted, steps, source: "mock" };
}
