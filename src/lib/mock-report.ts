// PLACEHOLDER DATA — design mockup only. Scores and signals are invented and
// will be replaced by real Qloo API results.

export type Signal = { label: string; strength: number; note: string };

export type Candidate = {
  id: string;
  name: string;
  kind: "headliner" | "sponsor";
  fit: number;
  verdict: string;
  why: string;
  signals: Signal[];
  caution?: string;
  image?: string;
};

export const event = {
  name: "Skyline Festival",
  meta: "Two days · 15,000 attendees · Indie / Electronic / Alt-pop",
  seeds: ["Tame Impala", "Fred again..", "Glass Animals", "Aesop", "Patagonia", "Spotify"],
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/1100`;

export const candidates: Candidate[] = [
  {
    id: "khruangbin",
    name: "Khruangbin",
    kind: "headliner",
    fit: 94,
    verdict: "Book",
    why: "Sits at the exact centre of the audience's taste cluster. Heavy overlap with the psychedelic and groove-led artists this crowd already follows, and a strong pull toward the design-conscious lifestyle brands they favour.",
    signals: [
      { label: "Artist affinity", strength: 96, note: "Shared fans with Tame Impala and Glass Animals" },
      { label: "Brand overlap", strength: 88, note: "Audience over-indexes on Aesop and Patagonia" },
      { label: "Lifestyle fit", strength: 91, note: "Travel, vinyl and design interests align" },
    ],
    image: img("khruangbin"),
  },
  {
    id: "bonobo",
    name: "Bonobo",
    kind: "headliner",
    fit: 89,
    verdict: "Book",
    why: "Electronic crossover with a loyal, adult listener base. Covers the dance half of the festival without drifting into mainstream EDM.",
    signals: [
      { label: "Artist affinity", strength: 90, note: "Strong overlap with Fred again.." },
      { label: "Brand overlap", strength: 80, note: "Spotify and premium audio brands" },
      { label: "Lifestyle fit", strength: 84, note: "Late-night and festival culture" },
    ],
    image: img("bonobo"),
  },
  {
    id: "billie",
    name: "Billie Eilish",
    kind: "headliner",
    fit: 71,
    verdict: "Consider",
    why: "Big draw and a reasonable taste match, but the audience skews younger and more mainstream than this crowd. Strong on reach, weaker on fit.",
    signals: [
      { label: "Artist affinity", strength: 68, note: "Partial overlap with Glass Animals" },
      { label: "Brand overlap", strength: 62, note: "Fashion-forward, less outdoor and craft" },
      { label: "Lifestyle fit", strength: 70, note: "Wide appeal, low specificity" },
    ],
    caution: "Likely the highest fee on the list for a middling fit score.",
    image: img("billie"),
  },
  {
    id: "post-malone",
    name: "Post Malone",
    kind: "headliner",
    fit: 38,
    verdict: "Avoid",
    why: "Little shared taste with this audience. The overlap that exists is incidental, not structural.",
    signals: [
      { label: "Artist affinity", strength: 31, note: "Minimal overlap with any seed artist" },
      { label: "Brand overlap", strength: 44, note: "Mass-market alcohol and fast food" },
      { label: "Lifestyle fit", strength: 40, note: "Different scene entirely" },
    ],
    caution: "A mismatched headliner is the fastest way to lose this crowd.",
    image: img("postmalone"),
  },
  {
    id: "lululemon",
    name: "Lululemon",
    kind: "sponsor",
    fit: 83,
    verdict: "Sponsor",
    why: "Wellness and active-lifestyle crossover with the festival's adult, design-literate audience. Natural fit for a daytime activation.",
    signals: [
      { label: "Brand overlap", strength: 85, note: "Shares an audience with Patagonia and Aesop" },
      { label: "Lifestyle fit", strength: 82, note: "Wellness, travel and fitness interests" },
      { label: "Artist affinity", strength: 72, note: "Fans of the booked headliners" },
    ],
    image: img("lululemon"),
  },
  {
    id: "red-bull",
    name: "Red Bull",
    kind: "sponsor",
    fit: 76,
    verdict: "Sponsor",
    why: "Deep music and event credibility. A safe, proven festival partner even if it is not a precise taste match.",
    signals: [
      { label: "Brand overlap", strength: 74, note: "Broad festival and music presence" },
      { label: "Lifestyle fit", strength: 78, note: "Nightlife and live events" },
      { label: "Artist affinity", strength: 75, note: "Active in electronic scenes" },
    ],
    image: img("redbull"),
  },
  {
    id: "harley",
    name: "Harley-Davidson",
    kind: "sponsor",
    fit: 22,
    verdict: "Avoid",
    why: "Almost no overlap with the audience's brand or music taste. A booth here would read as an interruption.",
    signals: [
      { label: "Brand overlap", strength: 18, note: "No shared audience with seed brands" },
      { label: "Lifestyle fit", strength: 26, note: "Different values and scene" },
      { label: "Artist affinity", strength: 23, note: "Opposite end of the music map" },
    ],
    caution: "This is the sponsor mismatch the report exists to catch.",
    image: img("harley"),
  },
];
