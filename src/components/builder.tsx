"use client";

import { useState } from "react";
import { searchEntities, slug, type Entry, type LineupRequest, type Seed } from "@/lib/lineup";

type Kind = "artist" | "brand" | "any";

function Picker({
  label,
  placeholder,
  kind,
  onAdd,
}: {
  label: string;
  placeholder: string;
  kind: Kind;
  onAdd: (name: string) => void;
}) {
  const [q, setQ] = useState("");
  const matches = searchEntities(q, kind);
  const typed = q.trim();
  const exact = matches.some((m) => m.toLowerCase() === typed.toLowerCase());

  const add = (name: string) => {
    onAdd(name);
    setQ("");
  };

  return (
    <div>
      <label className="label block" htmlFor={label}>
        {label}
      </label>
      <input
        id={label}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && typed) add(matches[0] ?? typed);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-2 w-full border-[3px] border-[var(--ink)] bg-transparent px-3 py-3 text-[18px] font-bold md:py-2 outline-none placeholder:font-medium placeholder:text-[var(--ink)]/55 focus:bg-[var(--paper)]"
      />
      {typed && (
        <ul className="border-x-[3px] border-b-[3px] border-[var(--ink)] bg-[var(--paper)]">
          {matches.map((m) => (
            <li key={m}>
              <button onClick={() => add(m)} className="press w-full px-3 py-3 text-left text-[17px] font-bold">
                {m}
              </button>
            </li>
          ))}
          {!exact && (
            <li>
              <button onClick={() => add(typed)} className="press w-full px-3 py-3 text-left text-[17px] font-medium">
                Add &ldquo;{typed}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function Chips({ names, onRemove }: { names: string[]; onRemove: (name: string) => void }) {
  if (!names.length) return <p className="mt-3 text-[15px] font-medium text-[var(--ink)]/70">Nothing added yet.</p>;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {names.map((n) => (
        <li key={n}>
          <button
            onClick={() => onRemove(n)}
            aria-label={`Remove ${n}`}
            className="cond press flex items-center gap-2 bg-[var(--ink)] px-3 py-2 text-[22px] md:py-1.5 md:text-[19px] text-[var(--paper)]"
          >
            {n}
            <span aria-hidden className="label text-[var(--ground)]">
              x
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Builder({
  initial,
  example,
  onRun,
  onBack,
}: {
  initial: LineupRequest;
  example: boolean;
  onRun: (r: LineupRequest) => void;
  onBack: () => void;
}) {
  const [eventName, setEventName] = useState(initial.eventName);
  const [seeds, setSeeds] = useState<Seed[]>(initial.seeds);
  const [entries, setEntries] = useState<Entry[]>(initial.entries);

  const addSeed = (name: string) =>
    setSeeds((s) => (s.some((x) => x.name.toLowerCase() === name.toLowerCase()) ? s : [...s, { id: slug(name), name }]));
  const addEntry = (kind: Entry["kind"]) => (name: string) =>
    setEntries((s) =>
      s.some((x) => x.name.toLowerCase() === name.toLowerCase())
        ? s
        : [...s, { id: slug(name) + "-" + kind, name, kind }],
    );
  const removeEntry = (name: string) => setEntries((s) => s.filter((x) => x.name !== name));

  const headliners = entries.filter((e) => e.kind === "headliner");
  const sponsors = entries.filter((e) => e.kind === "sponsor");
  const ready = eventName.trim() && seeds.length >= 1 && entries.length >= 2;

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      <div className="safe-top flex items-center justify-between px-5 pb-1">
        <span className="cond text-[22px]">Headliner</span>
        <button onClick={onBack} className="label press border-2 border-[var(--ink)] px-3 py-2">
          Back
        </button>
      </div>

      <div className="px-5 pb-40 pt-6 md:pb-52 md:pt-4">
        {example && (
          <div className="mb-6 bg-[var(--ink)] px-4 py-4 text-[var(--paper)]">
            <p className="label text-[var(--ground)]">Example event</p>
            <p className="mt-1 text-[16px] font-medium leading-snug">
              This is what an organizer enters: who the crowd loves, and who they&apos;re considering. Press Build the
              lineup to see the agent rank them. You can edit anything first.
            </p>
          </div>
        )}
        <h1 className="cond text-[44px] md:text-[36px]">{example ? "Skyline Festival" : "Your event"}</h1>
        <p className="label mt-2">Tell the agent who&apos;s coming and who&apos;s in the running</p>

        <section className="mt-8 md:mt-5">
          <label htmlFor="event-name" className="label block">
            Event name
          </label>
          <input
            id="event-name"
            placeholder="Name your event"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="cond mt-2 w-full border-[3px] border-[var(--ink)] bg-transparent px-3 py-2 text-[34px] md:text-[28px] outline-none focus:bg-[var(--paper)]"
          />
        </section>

        <section className="mt-8 border-t-[3px] border-[var(--ink)] pt-6 md:mt-5 md:pt-4">
          <h2 className="cond text-[32px] md:text-[26px]">The crowd</h2>
          <p className="mt-1 text-[15px] font-medium">What your attendees already love. Artists, brands, anything.</p>
          <div className="mt-4 md:mt-3">
            <Picker label="Add a favourite" placeholder="Search artists and brands" kind="any" onAdd={addSeed} />
          </div>
          <Chips names={seeds.map((s) => s.name)} onRemove={(n) => setSeeds((s) => s.filter((x) => x.name !== n))} />
        </section>

        <section className="mt-8 border-t-[3px] border-[var(--ink)] pt-6 md:mt-5 md:pt-4">
          <h2 className="cond text-[32px] md:text-[26px]">Headliner candidates</h2>
          <div className="mt-4 md:mt-3">
            <Picker label="Add an artist" placeholder="Search artists" kind="artist" onAdd={addEntry("headliner")} />
          </div>
          <Chips names={headliners.map((e) => e.name)} onRemove={removeEntry} />
        </section>

        <section className="mt-8 border-t-[3px] border-[var(--ink)] pt-6 md:mt-5 md:pt-4">
          <h2 className="cond text-[32px] md:text-[26px]">Sponsor candidates</h2>
          <div className="mt-4 md:mt-3">
            <Picker label="Add a brand" placeholder="Search brands" kind="brand" onAdd={addEntry("sponsor")} />
          </div>
          <Chips names={sponsors.map((e) => e.name)} onRemove={removeEntry} />
        </section>

        <p className="label mt-8 leading-relaxed">
          Search suggestions are placeholders until Qloo is connected. You can add any name.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-[var(--ground)]">
        <div className="gate-bottom mx-auto max-w-2xl px-5 pt-3">
          <button
            disabled={!ready}
            onClick={() => onRun({ eventName: eventName.trim(), seeds, entries })}
            className="cond press w-full bg-[var(--ink)] py-4 text-[36px] text-[var(--paper)] disabled:opacity-40 md:py-3 md:text-[30px]"
          >
            Build the lineup
          </button>
          {!ready && <p className="label mt-2 text-center">Add at least 1 favourite and 2 candidates</p>}
        </div>
      </div>
    </div>
  );
}
