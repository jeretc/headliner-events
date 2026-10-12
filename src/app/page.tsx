"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { candidates, event, type Candidate } from "@/lib/mock-report";

type Tab = "lineup" | "compare" | "audience";

const headliners = candidates.filter((c) => c.kind === "headliner");
const sponsors = candidates.filter((c) => c.kind === "sponsor");
const order = [...headliners, ...sponsors];
const isAvoid = (c: Candidate) => c.verdict === "Avoid";

// Billing size follows fit: the better the fit, the bigger the name.
function headlinerSize(c: Candidate) {
  const fill = 100 / (c.name.length * 0.43);
  const factor = (0.38 + 0.62 * (c.fit / 100)) * (isAvoid(c) ? 0.55 : 1);
  return `min(19cqw, ${(fill * factor).toFixed(2)}cqw)`;
}
function sponsorSize(c: Candidate) {
  return `${(3 + 6.5 * (c.fit / 100) * (isAvoid(c) ? 0.6 : 1)).toFixed(2)}cqw`;
}

type Step = { tag: "Resolve" | "Signals" | "Rank"; text: string; result?: string };

// Simulated trace built from the mock data; becomes the real Qloo call log later.
const steps: Step[] = [
  ...event.seeds.map((s) => ({ tag: "Resolve" as const, text: s, result: "entity matched" })),
  ...order.map((c) => ({
    tag: "Signals" as const,
    text: c.name,
    result: `${c.signals.length} signals pulled`,
  })),
  ...order.map((c) => ({ tag: "Rank" as const, text: c.name, result: `${c.fit} · ${c.verdict}` })),
];

function Gate({ onRun }: { onRun: () => void }) {
  return (
    <div className="poster safe-top safe-bottom mx-auto flex min-h-screen max-w-2xl flex-col px-5">
      <span className="cond text-[22px]">Headliner</span>
      <div className="mt-auto">
        <p className="label">Who to book. Who to sponsor.</p>
        <h1 className="cond mt-3 text-[24cqw]">
          Skyline
          <br />
          Festival
        </h1>
        <p className="label mt-4">{event.meta}</p>
        <p className="mt-6 max-w-sm text-[17px] font-medium leading-snug">
          {event.seeds.length} audience favourites. {candidates.length} candidates. One agent to rank them by real
          cultural fit.
        </p>
        <button
          onClick={onRun}
          className="cond press mt-8 w-full bg-[var(--ink)] py-5 text-[40px] text-[var(--paper)]"
        >
          Build the lineup
        </button>
      </div>
    </div>
  );
}

function Running({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (n >= steps.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), 170);
    return () => clearTimeout(t);
  }, [n, onDone]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [n]);

  const pct = Math.round((n / steps.length) * 100);
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[var(--ink)] text-[var(--paper)]">
      <div className="sticky top-0 z-10 bg-[var(--ink)]">
        <div className="safe-top mx-auto flex max-w-2xl items-center justify-between px-5 pb-3">
          <span className="label">Agent running · {pct}%</span>
          <button onClick={onDone} className="label press border-2 border-[var(--paper)] px-3 py-2">
            Skip
          </button>
        </div>
        <div className="h-[6px] bg-[var(--paper)]/15">
          <div className="h-full bg-[var(--ground)] transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-6">
        <p className="label text-[var(--ground)]">Simulated trace · live Qloo calls once connected</p>
        <ul className="mt-4">
          {steps.slice(0, n).map((s, i) => (
            <li key={i} className="line">
              <div>
                <div className="flex items-baseline gap-3 border-b border-[var(--paper)]/15 py-2.5">
                  <span className="label w-[68px] shrink-0 text-[var(--ground)]">{s.tag}</span>
                  <span className="cond flex-1 text-[26px]">{s.text}</span>
                  <span className="label text-right text-[var(--paper)]/60">{s.result}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [tab, setTab] = useState<Tab>("lineup");
  const [openId, setOpenId] = useState<string | null>(null);
  const finish = useCallback(() => setPhase("done"), []);

  if (phase === "idle") return <Gate onRun={() => setPhase("running")} />;
  if (phase === "running") return <Running onDone={finish} />;

  return (
    <div className="app-pad mx-auto min-h-screen max-w-2xl">
      <TopBar onRerun={() => setPhase("running")} />
      <main>
        {tab === "lineup" && <Lineup onOpen={setOpenId} />}
        {tab === "compare" && <Compare onOpen={setOpenId} />}
        {tab === "audience" && <Audience />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      {openId && <Detail id={openId} onChange={setOpenId} />}
    </div>
  );
}

function TopBar({ onRerun }: { onRerun: () => void }) {
  return (
    <header className="safe-top flex items-center justify-between px-5 pb-1">
      <span className="cond text-[22px]">Headliner</span>
      <div className="flex items-center gap-2">
        <span className="label border-2 border-[var(--ink)] px-2 py-1">Placeholder data</span>
        <button onClick={onRerun} className="label press bg-[var(--ink)] px-3 py-[7px] text-[var(--paper)]">
          Re-run
        </button>
      </div>
    </header>
  );
}

function Lineup({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section className="poster px-5 pb-10 pt-6 text-center">
      <p className="label">Recommended lineup</p>
      <h1 className="line mt-3">
        <span className="cond text-[17cqw]" style={{ ["--i" as string]: 0 }}>
          {event.name}
        </span>
      </h1>
      <p className="label mt-3">{event.meta}</p>

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
                style={{ fontSize: sponsorSize(c), ["--i" as string]: i + 6 }}
              >
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="label mt-10 text-left leading-relaxed">
        Bigger name = better cultural fit. Struck through = don&apos;t book. Tap any name for the evidence.
      </p>
    </section>
  );
}

function Compare({ onOpen }: { onOpen: (id: string) => void }) {
  const cols = ["Artist affinity", "Brand overlap", "Lifestyle fit"];
  return (
    <section className="px-5 pb-10 pt-6">
      <h1 className="cond text-[44px]">Side by side</h1>
      <p className="label mt-2">Three signals, every candidate</p>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_repeat(3,34px)_38px] items-end gap-x-1.5 border-b-[3px] border-[var(--ink)] pb-2">
        <span />
        {["Art", "Brand", "Life"].map((h) => (
          <span key={h} className="label text-center">{h}</span>
        ))}
        <span className="label text-center">Fit</span>
      </div>
      {order.map((c) => (
        <button
          key={c.id}
          onClick={() => onOpen(c.id)}
          className="press grid w-full grid-cols-[minmax(0,1fr)_repeat(3,34px)_38px] items-center gap-x-1.5 border-b border-[var(--ink)]/40 py-3 text-left"
        >
          <span className={`cond text-[22px] sm:text-[26px] ${isAvoid(c) ? "strike" : ""}`}>{c.name}</span>
          {cols.map((col) => {
            const s = c.signals.find((x) => x.label === col);
            return (
              <span key={col} className="text-center text-[15px] font-bold tabular-nums">
                {s ? s.strength : "–"}
              </span>
            );
          })}
          <span className="cond text-center text-[26px]">{c.fit}</span>
        </button>
      ))}
    </section>
  );
}

function Audience() {
  return (
    <section className="px-5 pb-10 pt-6">
      <h1 className="cond text-[44px]">The crowd</h1>
      <p className="label mt-2">What {event.name} attendees already love</p>
      <ul className="mt-6 border-t-[3px] border-[var(--ink)]">
        {event.seeds.map((s) => (
          <li key={s} className="cond border-b border-[var(--ink)]/40 py-3 text-[40px]">
            {s}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[15px] font-medium leading-relaxed">
        The agent scores every candidate against these. In the live version you enter your own audience, and the
        scores come from Qloo&apos;s taste graph.
      </p>
    </section>
  );
}

function Detail({ id, onChange }: { id: string; onChange: (id: string | null) => void }) {
  const idx = order.findIndex((c) => c.id === id);
  const c = order[idx];
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => onChange(order[(idx + d + order.length) % order.length].id),
    [idx, onChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onChange]);

  const avoid = isAvoid(c);

  return (
    <div
      className="sheet fixed inset-0 z-20 overflow-y-auto bg-[var(--paper)]"
      role="dialog"
      aria-label={`${c.name} evidence`}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 70) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div key={c.id} className="safe-top mx-auto max-w-2xl px-5 pb-16">
        <div className="flex items-center justify-between">
          <button onClick={() => onChange(null)} className="label press border-2 border-[var(--ink)] px-3 py-2">
            Close
          </button>
          <span className="label">
            {idx + 1} / {order.length}
          </span>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous" className="label press border-2 border-[var(--ink)] px-3 py-2">
              Prev
            </button>
            <button onClick={() => go(1)} aria-label="Next" className="label press border-2 border-[var(--ink)] px-3 py-2">
              Next
            </button>
          </div>
        </div>

        <p className="label mt-8">{c.kind === "headliner" ? "Headliner" : "Sponsor"}</p>
        <h2 className={`cond mt-2 text-[22vw] sm:text-[120px] ${avoid ? "strike" : ""}`}>{c.name}</h2>

        <div className="mt-6 flex items-stretch gap-3">
          <div className={`flex-1 px-4 py-3 ${avoid ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--ground)] text-[var(--ink)]"}`}>
            <p className="label">Cultural fit</p>
            <p className="cond text-[88px]">{c.fit}</p>
          </div>
          <div className="flex w-[34%] items-center justify-center border-[3px] border-[var(--ink)]">
            <span className="cond text-[34px]">{c.verdict}</span>
          </div>
        </div>

        <p className="mt-6 text-[19px] font-medium leading-snug">{c.why}</p>

        <p className="label mb-3 mt-8 border-t-[3px] border-[var(--ink)] pt-4">Evidence</p>
        <ul className="flex flex-col gap-5">
          {c.signals.map((s) => (
            <li key={s.label}>
              <div className="flex items-baseline justify-between">
                <span className="text-[17px] font-bold">{s.label}</span>
                <span className="cond text-[28px]">{s.strength}</span>
              </div>
              <div className="mt-1 h-[14px] bg-[var(--ink)]/15">
                <div className="bar-fill h-full bg-[var(--ink)]" style={{ width: `${s.strength}%` }} />
              </div>
              <p className="mt-1.5 text-[15px] text-[var(--ink)]/75">{s.note}</p>
            </li>
          ))}
        </ul>

        {c.caution && (
          <div className="mt-8 bg-[var(--ink)] px-4 py-4 text-[var(--paper)]">
            <p className="label text-[var(--ground)]">Heads up</p>
            <p className="mt-1 text-[17px] font-medium leading-snug">{c.caution}</p>
          </div>
        )}

        <p className="label mt-10 text-[var(--ink)]/60">Source: Qloo taste graph (mock data)</p>
      </div>
    </div>
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

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
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
