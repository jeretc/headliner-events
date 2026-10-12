# Headliner

**An agent that tells event organizers who to book and who to sponsor, and shows the evidence.**

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/).

> **Status: work in progress.** The app, agent flow and UI run today on placeholder data. The Qloo integration is being connected. Sections marked *(pending)* are filled in as it lands.

## 1. The problem

Festivals, conferences and brand activations spend most of their budget on two decisions: who headlines, and which brands sponsor. Both are usually made on gut feel, past ticket sales, or whoever's agent called first. A mismatch is expensive: a sponsor whose brand clashes with the crowd earns no goodwill, and a headliner who doesn't fit the audience leaves tickets unsold.

Headliners and sponsors are usually chosen by **fame**. Fame is not **fit**. A generic LLM answers "who should we book?" with the biggest names. Headliner answers it with the artists and brands this specific crowd actually gravitates toward.

## 2. What it does

1. The organizer describes the event's audience through things the attendees already love (artists, brands) and supplies a pool of candidate headliners and sponsors.
2. The agent resolves each name to a Qloo entity, pulls taste signals between the audience and every candidate, and ranks them.
3. The result is a **lineup poster**: the better the cultural fit, the bigger the billing. Tap any name for the evidence behind its rank, including a side-by-side of what a generic LLM would say versus what Qloo's data says.

It is an installable, mobile-first web app (PWA), designed as decision support, not a chat window.

## 3. How it uses Qloo *(pending)*

Qloo is what makes the ranking different from a generic answer. The plan, following Qloo's recommended chain of resolve, confirm, then ask the taste question:

| Step | Qloo capability | Why |
| --- | --- | --- |
| Resolve audience favourites and candidates to entities | Search / entity lookup | Turns names into taste-graph IDs; ambiguous matches are shown to the user |
| Rank the shortlist against the audience | Ranking workflow over `/v2/insights` | Scores candidates by fit with the audience signals |
| Explain each rank | Signal breakdown (artist affinity, brand overlap, lifestyle fit) | Shows the evidence, not just a number |

Calls run server-side only. The API key is never sent to the browser.

## 4. Example request to result *(pending)*

A redacted walkthrough of one real request and the Qloo response behind a ranking, including entity and tag choices, will be added here once the integration is live.

## 5. Run it yourself

Requires Node.js 22.19 or newer.

```bash
git clone https://github.com/jeretc/qloo-agentic-hackathon.git
cd qloo-agentic-hackathon
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
| `ANTHROPIC_API_KEY` | Claude API key, used for the generic-LLM comparison |

No secrets are committed to this repository. Hackathon keys only work against the hackathon API host.

## 6. Known limitations

- Qloo results describe what groups tend to like. They are not evidence about any individual and shouldn't be read as a guarantee a booking will succeed.
- A high fit score means cultural affinity with the audience you described. It says nothing about fees, availability, contracts or brand safety.
- Results depend on how well the audience favourites you enter represent the real crowd.
- No personal data is sent to Qloo. Audience inputs are public artists and brands only.
- Until the Qloo integration is complete, scores and search suggestions in the app are placeholders. The UI says so wherever they appear.

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, deployed on Vercel.

## Live demo

Link will be added at submission.

## License

[MIT](LICENSE)
