# Headliner

**An agent that tells event organizers who to book and who to sponsor, and shows the evidence.**

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/).

## 1. The problem

Festivals, conferences and brand activations spend most of their budget on two decisions: who headlines, and which brands sponsor. Both are usually made on gut feel, past ticket sales, or whoever's agent called first. A mismatch is expensive: a sponsor whose brand clashes with the crowd earns no goodwill, and a headliner who doesn't fit the audience leaves tickets unsold.

Headliners and sponsors are usually chosen by **fame**. Fame is not **fit**. A generic LLM answers "who should we book?" with the biggest names. Headliner answers it with the artists and brands this specific crowd actually gravitates toward.

## 2. What it does

**Who it's for:** event organizers (festivals, conferences, brand activations) choosing performers and sponsors for a specific audience.

**How an organizer uses it:**

1. **Describes the crowd** through things the attendees already love: artists, brands, anything. For example Tame Impala, Aesop and Patagonia.
2. **Brings a shortlist**: the artists under consideration for headline slots, and the brands under consideration as sponsors. Headliner ranks what the organizer brings; it does not invent candidates.
3. **Runs the agent.** A trace screen shows it working: matching each name, pulling taste signals, ranking.
4. **Reads the lineup poster.** The better the cultural fit, the bigger the billing. The weakest fits on the shortlist are small and struck through.
5. **Opens any name for the evidence**: a fit score, a verdict (book, consider or weakest fit), a short reason, evidence bars showing which of the crowd's favourites drive the match, and a side-by-side of what a generic LLM would say versus what Qloo's data says. A **Compare** tab lines up every pick: raw Qloo affinity, the generic LLM score, and fit.

**What "sponsors" means here:** sponsors are the companies that pay to be associated with an event, such as a drinks brand with a booth or a clothing brand on the signage. Choosing which ones to approach is part of an organizer's job. Headliner ranks the brands under consideration by fit with the crowd, so the organizer knows who to call first and who not to spend time on. It does not find sponsors the organizer hasn't thought of, and it does not contact anyone.

A one-tap **See an example** runs a fictional festival (Skyline Festival) end to end, so anyone can see a finished report immediately.

It is an installable, mobile-first web app (PWA), designed as decision support, not a chat window.

## 3. How it uses Qloo

Qloo is what makes the ranking different from a generic answer. Headliner follows Qloo's recommended chain: resolve names to entities, confirm, then ask the taste question.

| Step | Qloo endpoint | Why |
| --- | --- | --- |
| Suggest and resolve names as you type | `GET /search` (`types=urn:entity:artist` or `brand`) | Turns names into taste-graph entity IDs; near matches only, never an unrelated top hit |
| Rank the shortlist against the crowd | `GET /v2/insights` with `signal.interests.entities` (the crowd) and `filter.results.entities` (the shortlist) | Returns a Qloo affinity per candidate for exactly this audience |
| Explain each rank | `feature.explainability=true` on the same call | Shows which crowd favourites drive each match |

Artists are ranked as `filter.type=urn:entity:artist` and brands as `urn:entity:brand`, in separate calls, against the same crowd. Only documented endpoints and parameters are used, with `GET` requests and the `X-Api-Key` header.

The **fame vs fit** panel asks a general-purpose LLM (Google Gemini) to rate the same shortlist for the same audience from general knowledge only, with no Qloo data. Putting the two side by side is how you see what Qloo adds.

Calls run server-side only. The API key is never sent to the browser. Responses are cached privately on the server (Vercel Runtime Cache) to stay within quota, and are never stored in this repository.

## 4. Example request to result

A redacted shape of one ranking, with placeholder values (real Qloo data is not stored in this repo):

```text
GET /search?query=<crowd favourite>&types=urn:entity:artist&take=3
  -> results[0] = { entity_id: "<id>", name: "<name>", types: ["urn:entity:artist"] }

GET /v2/insights
    ?filter.type=urn:entity:artist
    &signal.interests.entities=<crowd id 1>,<crowd id 2>,...
    &filter.results.entities=<candidate id 1>,<candidate id 2>,...
    &feature.explainability=true
  -> results.entities[i].query = {
       affinity: 0.xx,                                  // Qloo affinity for this audience
       explainability: { "signal.interests.entities": [ { entity_id: "<crowd id>", score: 0.xx }, ... ] }
     }
```

Headliner turns that into the screen like this:

- **Fit** is each candidate's standing within the shortlist, with the best at 99. The raw Qloo affinity is shown next to it in Compare and in the evidence text.
- **Evidence bars** are the explainability scores: how much of the match comes from each crowd favourite.
- **Verdict:** 75 and above is book or sponsor, below 35 is the weakest fit, anything else is consider.
- A candidate that is also one of the crowd's favourites is marked a certain fit, because Qloo does not score an entity against its own audience.

## 5. Run it yourself

Requires Node.js 22.19 or newer.

```bash
git clone https://github.com/jeretc/headliner-events.git
cd headliner-events
cp .env.example .env.local   # then add your own keys
npm install
npm run dev
```

Open http://localhost:3000.

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `QLOO_API_KEY` | Your Qloo hackathon API key (server-side only) |
| `QLOO_API_BASE_URL` | `https://hackathon.api.qloo.com` |
| `GEMINI_API_KEY` | Google Gemini API key, used for the generic-LLM comparison (free tier is enough) |

No secrets are committed to this repository. Hackathon keys only work against the hackathon API host.

## 6. Known limitations

**About the data and Qloo**

- **Qloo's raw scores are close together.** For well-known artists and brands the raw affinity sits in a narrow band, roughly 0.65 to 0.95. Headliner therefore shows **fit as each pick's standing within your shortlist** (best = 99) and always shows the raw affinity next to it. The weakest pick on any list gets a low fit and a strike-through even when its raw affinity is still decent. Read it as "weakest of what you brought", not "bad".
- **Close calls.** When Qloo scores every pick in a group within about 5 points of each other, the picks are effectively tied. Headliner says so on the lineup and in each detail sheet ("close call"), and shows no strike-through or "overlooked" claim, because the order is then a tiebreak and not a clear verdict. Strike-throughs appear only when one pick clearly falls below the rest.
- **Coverage.** Qloo only knows the entities in its database. Names it does not recognise (for example some regional brands) are skipped, and the lineup page lists them so nothing disappears silently. Matching ignores case, accents and punctuation, but putting artists in the artist box and brands in the brand box still matters.
- **No self-scoring.** Qloo does not score an entity against its own audience, so a candidate that is also a crowd favourite is marked a certain fit instead of ranked.
- **Rate limits.** Qloo answers bursts with HTTP 429. Headliner limits concurrent calls and retries, so a full ranking can take 10 to 15 seconds the first time; repeats are served from cache.
- **Aggregate affinity only.** Qloo results describe what groups tend to like. They are not evidence about any individual and are not a guarantee a booking will succeed.

**About this app**

- **Scope.** Headliner ranks artists (headliners) and brands (sponsors) only, by design. Qloo supports other entity types, which are not used here.
- **The generic-LLM score is an estimate.** It comes from Gemini and can vary by around 10 points between slightly different requests. Identical requests are cached and repeat exactly. If the call fails or is rate limited, that panel is hidden.
- **Size limits.** A ranking takes up to 12 audience favourites and 20 candidates in total. The builder stops you at those limits.
- **Fair-use limits.** To protect the shared quota, each visitor can run about 12 rankings every 10 minutes. Beyond that the app says so and asks you to wait, instead of showing mock data.
- A high fit score says nothing about fees, availability, contracts or brand safety.
- Results depend on how well the crowd favourites you enter represent the real attendees.
- No personal data is sent to Qloo. Audience inputs are public artists and brands only.
- If Qloo is unreachable, the app falls back to clearly labelled mock data.

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, deployed on Vercel. Qloo API for taste data; Google Gemini for the generic-LLM comparison.

## Live demo

https://headliner-events.vercel.app

The app is free to use and needs no sign-in. Rankings use a shared Qloo quota, so each visitor is limited to about 12 runs every 10 minutes.

## License

[MIT](LICENSE)

## Disclaimer

Headliner is an independent project built for the Qloo Agentic Hackathon. It is not affiliated with or endorsed by Qloo.
