// Server-only Qloo client. Never import from client components: the key stays on the server.
import { getCache } from "@vercel/functions";
import type { Candidate } from "./mock-report";
import type { LineupRequest, LineupResult, Step } from "./lineup";

const BASE = process.env.QLOO_API_BASE_URL ?? "https://hackathon.api.qloo.com";
const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

export const qlooConfigured = () => Boolean(process.env.QLOO_API_KEY);

const rc = () => {
  try {
    return getCache({ namespace: "qloo" });
  } catch {
    return null;
  }
};
async function sharedGet<T>(key: string): Promise<T | undefined> {
  try {
    return ((await rc()?.get(key)) ?? undefined) as T | undefined;
  } catch {
    return undefined;
  }
}
async function sharedSet(key: string, data: unknown) {
  try {
    await rc()?.set(key, data, { ttl: TTL_MS / 1000, name: "qloo-response" });
  } catch {}
}

// Qloo answers 429 to bursts, so cap concurrent upstream calls.
const MAX_CONCURRENT = 2;
let active = 0;
const waiting: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((res) => waiting.push(res));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

async function qlooGet<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const ck = url.toString();
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data as T;
  // Second level: Vercel Runtime Cache, shared across instances and cold starts (private, never in the repo).
  const shared = await sharedGet<T>(ck);
  if (shared != null) {
    cache.set(ck, { at: Date.now(), data: shared });
    return shared;
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await slot(() => fetch(url, { headers: { "X-Api-Key": process.env.QLOO_API_KEY ?? "" }, cache: "no-store" }));
      if (r.status === 429 || r.status >= 500) throw new Error(`Qloo ${r.status}`);
      if (!r.ok) throw Object.assign(new Error(`Qloo ${r.status}`), { fatal: true });
      const data = (await r.json()) as T;
      cache.set(ck, { at: Date.now(), data });
      void sharedSet(ck, data);
      return data;
    } catch (e) {
      lastErr = e;
      if ((e as { fatal?: boolean }).fatal) break;
      await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
    }
  }
  throw lastErr;
}

type Kind = "artist" | "brand";
export type Hit = { id: string; name: string; kind: Kind; image?: string };

type SearchResp = {
  results?: { entity_id: string; name: string; types: string[]; properties?: { image?: { url?: string } } }[];
};

export async function searchQloo(query: string, kind: Kind, take = 6): Promise<Hit[]> {
  const j = await qlooGet<SearchResp>("/search", { query, types: `urn:entity:${kind}`, take });
  return (j.results ?? []).map((r) => ({ id: r.entity_id, name: r.name, kind, image: r.properties?.image?.url }));
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

async function resolve(name: string, kinds: Kind[]): Promise<Hit | null> {
  const all = (await Promise.all(kinds.map((k) => searchQloo(name, k, 3).catch(() => [] as Hit[])))).flat();
  const exact = all.filter((h) => same(h.name, name));
  const pick = exact.find((h) => h.kind === "brand") ?? exact[0];
  if (pick) return pick;
  const n = name.trim().toLowerCase();
  // Accept a near match (one name contains the other), never an unrelated top hit.
  return all.find((h) => h.name.toLowerCase().includes(n) || n.includes(h.name.toLowerCase())) ?? null;
}

type InsightsResp = {
  results?: {
    entities?: {
      entity_id: string;
      name: string;
      popularity?: number;
      query?: { affinity?: number; explainability?: Record<string, { entity_id: string; score: number }[]> };
    }[];
  };
};

async function rank(kind: Kind, seedIds: string[], candidateIds: string[]) {
  const j = await qlooGet<InsightsResp>("/v2/insights", {
    "filter.type": `urn:entity:${kind}`,
    "signal.interests.entities": seedIds.join(","),
    "filter.results.entities": candidateIds.join(","),
    "feature.explainability": "true",
    take: candidateIds.length,
  });
  return j.results?.entities ?? [];
}

const uniq = <T,>(xs: T[], key: (x: T) => string) => [...new Map(xs.map((x) => [key(x).trim().toLowerCase(), x])).values()];

export async function qlooLineup(input: LineupRequest): Promise<LineupResult> {
  const request: LineupRequest = {
    ...input,
    seeds: uniq(input.seeds, (s) => s.name),
    entries: uniq(input.entries, (e) => `${e.kind}:${e.name}`),
  };
  const steps: Step[] = [];
  const skipped: string[] = [];
  const seedHits = (await Promise.all(request.seeds.map((s) => resolve(s.name, ["artist", "brand"])))).filter(
    (h): h is Hit => h !== null,
  );
  const seedName = new Map(seedHits.map((h) => [h.id.toLowerCase(), h.name]));
  for (const s of request.seeds) {
    const h = seedHits.find((x) => same(x.name, s.name));
    if (!h) skipped.push(s.name);
    steps.push({ tag: "Resolve", text: s.name, result: h ? `matched ${h.kind}: ${h.name}` : "no match, skipped" });
  }
  if (!seedHits.length) throw new Error("No audience seeds could be resolved");

  const candidates: Candidate[] = [];
  for (const [kind, role] of [["artist", "headliner"], ["brand", "sponsor"]] as const) {
    const wanted = request.entries.filter((e) => e.kind === role);
    if (!wanted.length) continue;
    const hits = (await Promise.all(wanted.map((e) => resolve(e.name, [kind])))).map((h, i) => ({ h, e: wanted[i] }));
    const found = hits.filter((x): x is { h: Hit; e: (typeof wanted)[number] } => x.h !== null);
    for (const x of hits) if (!x.h) { skipped.push(x.e.name); steps.push({ tag: "Resolve", text: x.e.name, result: "no match, skipped" }); }
    if (!found.length) continue;

    // Qloo never scores an entity against its own audience, so a candidate that is also a crowd favourite is a certain fit.
    const seedIds = new Set(seedHits.map((h) => h.id.toLowerCase()));
    for (const x of found.filter((x) => seedIds.has(x.h.id.toLowerCase()))) {
      const verdict = role === "headliner" ? "Book" : "Sponsor";
      candidates.push({
        id: x.e.id,
        name: x.h.name,
        kind: role,
        fit: 99,
        crowdFavourite: true,
        verdict,
        why: `${x.h.name} is already one of this crowd's favourites, so it is a certain fit. Qloo does not score an entity against its own audience.`,
        signals: [],
        image: x.h.image,
      });
      steps.push({ tag: "Rank", text: x.h.name, result: `99 · ${verdict} (crowd favourite)` });
    }
    const rest = found.filter((x) => !seedIds.has(x.h.id.toLowerCase()));
    if (!rest.length) continue;

    const ranked = await rank(kind, seedHits.map((s) => s.id), rest.map((x) => x.h.id));
    const byId = new Map(ranked.map((r) => [r.entity_id.toLowerCase(), r]));
    const withR = rest.map((x) => ({ ...x, r: byId.get(x.h.id.toLowerCase()) }));
    for (const x of withR) if (!x.r) { skipped.push(x.h.name); steps.push({ tag: "Rank", text: x.h.name, result: "no Qloo score, skipped" }); }
    const scored = withR
      .filter((x) => x.r)
      .sort((a, b) => (b.r?.query?.affinity ?? 0) - (a.r?.query?.affinity ?? 0));
    if (!scored.length) continue;

    // Qloo affinities for well-known names cluster in a narrow band (roughly 0.65-0.95), so the fit
    // score is each pick's standing within THIS shortlist (best = 99); the raw affinity stays in the evidence text.
    const top = scored[0].r?.query?.affinity ?? 0;
    const bottom = scored[scored.length - 1].r?.query?.affinity ?? 0;
    const range = Math.max(top - bottom, 0.12);
    scored.forEach((x, i) => {
      const affinity = x.r?.query?.affinity ?? 0;
      const fit = scored.length === 1 ? Math.round(affinity * 100) : Math.max(3, Math.min(99, Math.round(((affinity - (top - range)) / range) * 100)));
      const verdict = fit < 35 ? "Avoid" : fit >= 75 ? (role === "headliner" ? "Book" : "Sponsor") : "Consider";
      const expl = Object.values(x.r?.query?.explainability ?? {})[0] ?? [];
      const named = expl
        .map((s) => ({ name: seedName.get(s.entity_id.toLowerCase()), score: s.score }))
        .filter((s): s is { name: string; score: number } => Boolean(s.name))
        .sort((a, b) => b.score - a.score);
      const total = named.reduce((n, s) => n + s.score, 0) || 1;
      const signals = named.slice(0, 5).map((s) => ({
        label: s.name,
        strength: Math.round((s.score / named[0].score) * 100),
        note: `${Math.round((s.score / total) * 100)}% of the match comes from audience overlap with ${s.name}`,
      }));
      const lead = signals.slice(0, 2).map((s) => s.label).join(" and ");
      candidates.push({
        id: x.e.id,
        name: x.h.name,
        kind: role,
        fit,
        affinity: Math.round(affinity * 100),
        verdict,
        why: lead
          ? `Qloo's taste graph links ${x.h.name} most strongly to the audience of ${lead}. Qloo affinity ${affinity.toFixed(2)}, ranked ${i + 1} of ${scored.length} ${role}s on this shortlist.`
          : `Qloo returns an affinity of ${affinity.toFixed(2)} for this audience, ranked ${i + 1} of ${scored.length} ${role}s on this shortlist.`,
        signals,
        image: x.h.image,
      });
      steps.push({ tag: "Signals", text: x.h.name, result: `${expl.length} audience signals` });
      steps.push({ tag: "Rank", text: x.h.name, result: `${fit} · ${verdict}` });
    });
  }
  const order = { Resolve: 0, Signals: 1, Rank: 2 };
  steps.sort((a, b) => order[a.tag] - order[b.tag]);
  return { request, candidates, steps, skipped, source: "qloo" };
}
