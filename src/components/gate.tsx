"use client";

import type { LineupRequest } from "@/lib/lineup";

export function Gate({
  request,
  onDemo,
  onCustom,
}: {
  request: LineupRequest;
  onDemo: () => void;
  onCustom: () => void;
}) {
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
        <p className="mt-6 max-w-sm text-[17px] font-medium leading-snug">
          {request.seeds.length} audience favourites. {request.entries.length} candidates. One agent to rank them by
          real cultural fit.
        </p>
        <button onClick={onDemo} className="cond press mt-8 w-full bg-[var(--ink)] py-5 text-[40px] text-[var(--paper)]">
          Build the lineup
        </button>
        <button
          onClick={onCustom}
          className="cond press mt-3 w-full border-[3px] border-[var(--ink)] py-4 text-[28px]"
        >
          Set up your own event
        </button>
      </div>
    </div>
  );
}
