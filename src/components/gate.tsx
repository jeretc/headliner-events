"use client";

export function Gate({ onDemo, onCustom }: { onDemo: () => void; onCustom: () => void }) {
  return (
    <div className="poster safe-top gate-bottom mx-auto flex min-h-screen max-w-2xl flex-col px-5">
      <div className="flex items-center justify-between">
        <span className="label">Powered by Qloo&apos;s taste graph</span>
      </div>

      <div className="mt-auto">
        <p className="label mb-2">For festivals, conferences and brand events</p>
        <h1 className="cond text-[22cqw]">Headliner</h1>
        <p className="cond mt-4 text-[9cqw] leading-[0.95]">
          Fame fills a poster.
          <br />
          Fit fills a festival.
        </p>
        <p className="mt-5 max-w-md text-[17px] font-medium leading-snug">
          Tell it who&apos;s coming. It ranks who to book and who to sponsor, and shows the evidence behind every pick.
        </p>

        <div className="mt-8 border-t-[3px] border-[var(--ink)] pt-4" aria-hidden>
          <p className="label">Fit decides billing</p>
          <div className="mt-3 flex flex-col items-start gap-[0.6cqw]">
            <span className="cond text-[13cqw]">Khruangbin</span>
            <span className="cond text-[9cqw]">Bonobo</span>
            <span className="cond strike text-[5cqw]">Post Malone</span>
          </div>
        </div>

        <button onClick={onCustom} className="cond press mt-8 w-full bg-[var(--ink)] py-5 text-[36px] text-[var(--paper)]">
          Plan my event
        </button>
        <button
          onClick={onDemo}
          className="cond press mt-3 w-full border-[3px] border-[var(--ink)] py-4 text-[28px]"
        >
          See an example
        </button>
      </div>
    </div>
  );
}
