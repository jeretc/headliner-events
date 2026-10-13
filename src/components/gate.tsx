"use client";

export function Gate({ onDemo, onCustom }: { onDemo: () => void; onCustom: () => void }) {
  return (
    <div className="poster safe-top gate-bottom gate-root mx-auto flex max-w-2xl flex-col px-5">
      <div className="flex items-center justify-between">
        <span className="label">Taste data from the Qloo API</span>
      </div>

      <div className="mt-auto">
        <p className="label mb-2">For festivals, conferences and brand events</p>
        <h1 className="cond text-[22cqw]">Headliner</h1>
        <p className="cond gate-gap-sm text-[9cqw] leading-[0.95]">
          Fame fills a poster.
          <br />
          Fit fills a festival.
        </p>
        <p className="gate-gap-sm max-w-md text-[17px] font-medium leading-snug">
          Tell it who&apos;s coming. It ranks who to book and who to sponsor, and shows the evidence behind every pick.
        </p>

        <div className="gate-teaser gate-gap border-t-[3px] border-[var(--ink)] pt-4" aria-hidden>
          <p className="label">Fit decides billing</p>
          <div className="mt-3 flex flex-col items-start gap-[0.6cqw]">
            <span className="cond text-[13cqw]">Khruangbin</span>
            <span className="cond text-[9cqw]">Bonobo</span>
            <span className="cond strike text-[5cqw]">Metallica</span>
          </div>
        </div>

        <button onClick={onCustom} className="cond press gate-gap w-full bg-[var(--ink)] py-[clamp(0.75rem,2.4dvh,1.25rem)] text-[36px] text-[var(--paper)]">
          Plan my event
        </button>
        <button
          onClick={onDemo}
          className="cond press mt-3 w-full border-[3px] border-[var(--ink)] py-[clamp(0.6rem,2dvh,1rem)] text-[28px]"
        >
          See an example
        </button>
      </div>
    </div>
  );
}
