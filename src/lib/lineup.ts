import { candidates as demoCandidates, event as demoEvent, type Candidate } from "./mock-report";

export type Seed = { id: string; name: string };
export type Entry = { id: string; name: string; kind: "headliner" | "sponsor" };
export type LineupRequest = { eventName: string; seeds: Seed[]; entries: Entry[] };
export type Step = { tag: "Resolve" | "Signals" | "Rank"; text: string; result?: string };
export type LineupResult = {
  request: LineupRequest;
  candidates: Candidate[];
  steps: Step[];
  skipped?: string[];
  source: "mock" | "qloo";
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const demoRequest: LineupRequest = {
  eventName: demoEvent.name,
  seeds: demoEvent.seeds.map((name) => ({ id: slug(name), name })),
  entries: [
    ...demoCandidates.map((c) => ({ id: c.id, name: c.name, kind: c.kind })),
    { id: "four-tet", name: "Four Tet", kind: "headliner" as const },
    { id: "metallica", name: "Metallica", kind: "headliner" as const },
    { id: "allbirds", name: "Allbirds", kind: "sponsor" as const },
    { id: "walmart", name: "Walmart", kind: "sponsor" as const },
  ],
};

export const blankRequest: LineupRequest = { eventName: "", seeds: [], entries: [] };

// Fallback suggestions used only if /api/search is unavailable.
const artists = [
  "Tame Impala", "Fred again..", "Glass Animals", "Khruangbin", "Bonobo", "Billie Eilish", "Post Malone",
  "The Weeknd", "Radiohead", "Four Tet", "Caribou", "Mac DeMarco", "Arctic Monkeys", "Dua Lipa", "Kendrick Lamar",
  "Jungle", "Disclosure", "Beach House", "Phoebe Bridgers", "Daft Punk",
];
const brands = [
  "Aesop", "Patagonia", "Spotify", "Lululemon", "Red Bull", "Harley-Davidson", "Heineken", "Coca-Cola", "Nike",
  "Oatly", "Allbirds", "Corona", "Monster Energy", "Rolex", "Apple", "Levi's", "Vans", "Stella Artois", "Tesla", "Notion",
];

export type Suggestion = { name: string; kind: "artist" | "brand" };

function mockSearch(query: string, kind: "artist" | "brand" | "any"): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool: Suggestion[] = [
    ...(kind === "brand" ? [] : artists.map((name) => ({ name, kind: "artist" as const }))),
    ...(kind === "artist" ? [] : brands.map((name) => ({ name, kind: "brand" as const }))),
  ];
  return pool.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 6);
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

// PLACEHOLDER: what a generic LLM would say from fame alone. Replaced by a real Claude call
// that sees the same shortlist but no Qloo data.
const demoGeneric: Record<string, { score: number; line: string }> = {
  khruangbin: { score: 58, line: "Respected indie act, but smaller than the usual festival headliner." },
  bonobo: { score: 55, line: "Solid electronic name, a bit niche for a main stage." },
  "billie eilish": { score: 96, line: "Huge global star and a guaranteed crowd-puller." },
  "post malone": { score: 94, line: "Chart-topping crossover star with enormous appeal." },
  lululemon: { score: 78, line: "Premium lifestyle brand with strong reach." },
  "red bull": { score: 90, line: "The default festival sponsor: big, proven, everywhere." },
  "harley-davidson": { score: 74, line: "Iconic heritage brand with a loyal following." },
};

function withGeneric(c: Candidate): Candidate {
  const g = demoGeneric[c.name.toLowerCase()];
  if (g) return { ...c, generic: g };
  const score = 40 + ((hash(c.name.toLowerCase()) >> 5) % 55);
  return { ...c, generic: { score, line: "Broadly popular choice, judged on general fame." } };
}

// Single entry point for the UI. Real Qloo ranking via /api/lineup; falls back to mock data if unavailable.
export async function getLineup(request: LineupRequest): Promise<LineupResult> {
  try {
    const r = await fetch("/api/lineup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (r.ok) return (await r.json()) as LineupResult;
  } catch {}
  return mockLineup(request);
}

function mockLineup(request: LineupRequest): LineupResult {
  const demoByName = new Map(demoCandidates.map((c) => [c.name.toLowerCase(), c]));
  const all = request.entries.map((e) => withGeneric(demoByName.get(e.name.toLowerCase()) ?? mockCandidate(e)));
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

export async function searchEntities(query: string, kind: "artist" | "brand" | "any"): Promise<Suggestion[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&kind=${kind}`);
    if (r.ok) {
      const { results } = (await r.json()) as { results: Suggestion[] };
      return results;
    }
  } catch {}
  return mockSearch(q, kind);
}
