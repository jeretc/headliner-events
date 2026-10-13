"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Candidate } from "@/lib/mock-report";
import { guideTarget, isAvoid } from "./report";

export function Detail({
  order,
  id,
  guided,
  live,
  onChange,
}: {
  order: Candidate[];
  id: string;
  guided: boolean;
  live?: boolean;
  onChange: (id: string | null) => void;
}) {
  const idx = order.findIndex((c) => c.id === id);
  const c = order[idx];
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => onChange(order[(idx + d + order.length) % order.length].id),
    [idx, order, onChange],
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

  if (!c) return null;
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
        <h2 className={`cond mt-2 text-[17vw] sm:text-[88px] ${avoid ? "strike" : ""}`}>{c.name}</h2>

        <div className="mt-6 flex items-stretch gap-3">
          <div
            className={`flex-1 px-4 py-3 ${avoid ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--ground)] text-[var(--ink)]"}`}
          >
            <p className="label">Cultural fit</p>
            <p className="cond text-[88px]">{c.fit}</p>
          </div>
          <div className="flex w-[34%] items-center justify-center border-[3px] border-[var(--ink)]">
            <span className="cond text-center text-[34px] leading-none">{isAvoid(c) ? "Weakest fit" : c.verdict}</span>
          </div>
        </div>

        <p className="mt-6 text-[19px] font-medium leading-snug">{c.why}</p>

        {c.generic && (
          <div className="mt-8 border-t-[3px] border-[var(--ink)] pt-4">
            {guided && guideTarget(order)?.id === c.id && (
              <p className="mb-3 bg-[var(--ground)] px-3 py-2 text-[15px] font-bold leading-snug">
                This is the point of Headliner: fame says one thing, Qloo&apos;s taste data says another.
              </p>
            )}
            <p className="label">Fame vs fit</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="border-[3px] border-[var(--ink)] px-3 py-3">
                <p className="label">Generic LLM</p>
                <p className="cond mt-1 text-[56px]">{c.generic.score}</p>
                <p className="mt-1 text-[14px] font-medium leading-snug">{c.generic.line}</p>
              </div>
              <div className="bg-[var(--ink)] px-3 py-3 text-[var(--paper)]">
                <p className="label text-[var(--ground)]">With Qloo</p>
                <p className="cond mt-1 text-[56px]">{c.fit}</p>
                <p className="mt-1 text-[14px] font-medium leading-snug">Fit for this exact audience, relative to your shortlist.</p>
              </div>
            </div>
            {c.generic.score >= 75 && c.fit < 50 && (
              <p className="mt-3 text-[16px] font-bold leading-snug">
                Looks like a safe hit. Doesn&apos;t fit this crowd.
              </p>
            )}
            {c.generic.score < 65 && c.fit >= 80 && (
              <p className="mt-3 text-[16px] font-bold leading-snug">
                Easy to overlook on fame. This crowd&apos;s taste points straight at it.
              </p>
            )}
            <p className="label mt-3 text-[var(--ink)]/60">Generic answer: an LLM using general knowledge only, no Qloo data</p>
          </div>
        )}

        <p className="label mb-3 mt-8 border-t-[3px] border-[var(--ink)] pt-4">Evidence · bars are relative to the strongest link</p>
        <ul className="flex flex-col gap-5">
          {c.signals.map((s) => (
            <li key={s.label}>
              <div className="flex items-baseline justify-between">
                <span className="text-[18px] font-bold">{s.label}</span>
                <span className="cond text-[36px]">{s.strength}</span>
              </div>
              <div className="mt-1.5 h-[22px] bg-[var(--ink)]/15">
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

        <p className="label mt-10 text-[var(--ink)]/60">Source: Qloo taste graph{live ? "" : " (mock data)"}</p>
      </div>
    </div>
  );
}
