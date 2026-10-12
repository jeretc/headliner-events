"use client";

import type { Candidate } from "@/lib/mock-report";
import type { LineupResult } from "@/lib/lineup";

export type Tab = "lineup" | "compare" | "audience";

export const isAvoid = (c: Candidate) => c.verdict === "Avoid";

// Billing size follows fit: the better the fit, the bigger the name.
function headlinerSize(c: Candidate) {
  const fill = 100 / (c.name.length * 0.43);
  const factor = (0.38 + 0.62 * (c.fit / 100)) * (isAvoid(c) ? 0.55 : 1);
  return `min(19cqw, ${(fill * factor).toFixed(2)}cqw)`;
}
function sponsorSize(c: Candidate) {
  return `${(3 + 6.5 * (c.fit / 100) * (isAvoid(c) ? 0.6 : 1)).toFixed(2)}cqw`;
}

export function TopBar({ onRerun }: { onRerun: () => void }) {
  return (
    <header className="safe-top flex items-center justify-between px-5 pb-1">
      <span className="cond text-[22px]">Headliner</span>
      <div className="flex items-center gap-2">
        <span className="label border-2 border-[var(--ink)] px-2 py-1">Placeholder data</span>
        <button onClick={onRerun} className="label press bg-[var(--ink)] px-3 py-[7px] text-[var(--paper)]">
          Edit
        </button>
      </div>
    </header>
  );
}

export function Lineup({ result, onOpen }: { result: LineupResult; onOpen: (id: string) => void }) {
  const headliners = result.candidates.filter((c) => c.kind === "headliner");
  const sponsors = result.candidates.filter((c) => c.kind === "sponsor");
  return (
    <section className="poster px-5 pb-10 pt-6 text-center">
      <p className="label">Recommended lineup</p>
      <h1 className="line mt-3">
        <span className="cond text-[17cqw]" style={{ ["--i" as string]: 0 }}>
          {result.request.eventName}
        </span>
      </h1>
      <p className="label mt-3">
        {result.request.seeds.length} audience favourites · {result.candidates.length} candidates
      </p>

      {headliners.length > 0 && (
        <div className="mt-8 border-t-[3px] border-[var(--ink)] pt-8">
          <p className="label mb-5">Headline</p>
          <div className="flex flex-col items-center gap-[1.6cqw]">
            {headliners.map((c, i) => (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="line press w-full"
                aria-label={`${c.name}, fit ${c.fit}. Open evidence`}
              >
                <span
                  className={`cond ${isAvoid(c) ? "strike" : ""}`}
                  style={{ fontSize: headlinerSize(c), ["--i" as string]: i + 1 }}
                >
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {sponsors.length > 0 && (
        <div className="mt-8 border-t-[3px] border-[var(--ink)] pt-8">
          <p className="label mb-5">Presented by</p>
          <div className="flex flex-wrap items-baseline justify-center gap-x-[3cqw] gap-y-[2cqw]">
            {sponsors.map((c, i) => (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="line press"
                aria-label={`${c.name}, fit ${c.fit}. Open evidence`}
              >
                <span
                  className={`cond ${isAvoid(c) ? "strike" : ""}`}
                  style={{ fontSize: sponsorSize(c), ["--i" as string]: i + headliners.length + 1 }}
                >
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="label mt-10 text-left leading-relaxed">
        Bigger name = better cultural fit. Struck through = don&apos;t book. Tap any name for the evidence.
      </p>
    </section>
  );
}

export function Compare({ result, onOpen }: { result: LineupResult; onOpen: (id: string) => void }) {
  const cols = ["Artist affinity", "Brand overlap", "Lifestyle fit"];
  const grid = "grid-cols-[minmax(0,1fr)_repeat(3,34px)_38px]";
  return (
    <section className="px-5 pb-10 pt-6">
      <h1 className="cond text-[44px]">Side by side</h1>
      <p className="label mt-2">Three signals, every candidate</p>
      <div className={`mt-6 grid ${grid} items-end gap-x-1.5 border-b-[3px] border-[var(--ink)] pb-2`}>
        <span />
        {["Art", "Brand", "Life"].map((h) => (
          <span key={h} className="label text-center">
            {h}
          </span>
        ))}
        <span className="label text-center">Fit</span>
      </div>
      {result.candidates.map((c) => (
        <button
          key={c.id}
          onClick={() => onOpen(c.id)}
          className={`press grid w-full ${grid} items-center gap-x-1.5 border-b border-[var(--ink)]/40 py-3 text-left`}
        >
          <span className={`cond text-[22px] sm:text-[26px] ${isAvoid(c) ? "strike" : ""}`}>{c.name}</span>
          {cols.map((col) => {
            const s = c.signals.find((x) => x.label === col);
            return (
              <span key={col} className="text-center text-[15px] font-bold tabular-nums">
                {s ? s.strength : "-"}
              </span>
            );
          })}
          <span className="cond text-center text-[26px]">{c.fit}</span>
        </button>
      ))}
    </section>
  );
}

export function Audience({ result }: { result: LineupResult }) {
  return (
    <section className="px-5 pb-10 pt-6">
      <h1 className="cond text-[44px]">The crowd</h1>
      <p className="label mt-2">What {result.request.eventName} attendees already love</p>
      <ul className="mt-6 border-t-[3px] border-[var(--ink)]">
        {result.request.seeds.map((s) => (
          <li key={s.id} className="cond border-b border-[var(--ink)]/40 py-3 text-[40px]">
            {s.name}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[15px] font-medium leading-relaxed">
        The agent scores every candidate against these. Scores come from Qloo&apos;s taste graph once connected.
      </p>
    </section>
  );
}

const icons: Record<Tab, React.ReactNode> = {
  lineup: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <rect x="3" y="4" width="18" height="4" />
      <rect x="6" y="10" width="12" height="4" />
      <rect x="9" y="16" width="6" height="4" />
    </svg>
  ),
  compare: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  ),
  audience: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),
};

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { key: Tab; label: string }[] = [
    { key: "lineup", label: "Lineup" },
    { key: "compare", label: "Compare" },
    { key: "audience", label: "Crowd" },
  ];
  return (
    <nav className="tabbar fixed inset-x-0 bottom-0 z-10 bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto flex h-[var(--tabbar)] max-w-2xl">
        {items.map((i) => (
          <button
            key={i.key}
            onClick={() => onChange(i.key)}
            aria-current={tab === i.key ? "page" : undefined}
            className={`press flex flex-1 flex-col items-center justify-center gap-1 ${
              tab === i.key ? "text-[var(--ground)]" : "text-[var(--paper)]/70"
            }`}
          >
            {icons[i.key]}
            <span className="label">{i.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
