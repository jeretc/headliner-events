"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/lineup";

export function Trace({ steps, onDone }: { steps: Step[]; onDone: () => void }) {
  const [n, setN] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (n >= steps.length) {
      const t = setTimeout(onDone, 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), 400);
    return () => clearTimeout(t);
  }, [n, steps.length, onDone]);

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
